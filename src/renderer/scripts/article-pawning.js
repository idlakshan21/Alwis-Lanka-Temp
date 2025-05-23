
import {
    validateNICField,
    validateCustomerNameField,
    validateAddress1Field,
    validateAddress2Field,
    validatePhone1Field,
    validatePhone2Field,
    validateEmailField,
    validateGenderField,
    validateCustomerForm
} from '../../validation/customerValidation.js';


import { fetchCustomerByNIC, saveCustomerData, savePawningData, fetchTicketData } from '../../api/api.js';


let articles = [];
let totalGoldValueSum = 0;
let totalInterestSum = 0;
let totalCalculatedLoanSum = 0;
let totalAdjustedLoanSum = 0;
let totalAdjustmentSum = 0;
let currentPage = 1;
let currentCustomerId = null;


function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = (currentPage / 3 * 100) + '%';
}

//get article name from input
function getArticleName() {
    const articleSelect = document.getElementById('articleSelect');
    const customArticle = document.getElementById('customArticle');

    if (articleSelect.style.display === 'none') {
        return customArticle.value.trim() || 'Unnamed Article';
    }
    return articleSelect.value;
}

//get article name from input
function getDuration() {
    const durationSelect = document.getElementById('durationSelect');
    const customDuration = document.getElementById('customDuration');

    if (durationSelect.style.display === 'none') {
        return parseInt(customDuration.value) || 1;
    }
    return parseInt(durationSelect.value) || 1;
}

function getDurationText() {
    const durationSelect = document.getElementById('durationSelect');
    const customDuration = document.getElementById('customDuration');
    const duration = getDuration();

    if (durationSelect.style.display === 'none') {
        return duration + (duration === 1 ? " Month" : " Months");
    }
    if (durationSelect.value !== 'custom') {
        return durationSelect.options[durationSelect.selectedIndex].text;
    }
    return duration + (duration === 1 ? " Month" : " Months");
}


function calculateDueDate(durationMonths) {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setMonth(today.getMonth() + durationMonths);
    return dueDate.toLocaleDateString();
}


function calculateDailyInterest(totalInterest, durationMonths) {
    const daysInPeriod = durationMonths * 30;
    return totalInterest / daysInPeriod;
}


function calculateAndAddItem() {
    const grossWeight = parseFloat(document.getElementById('grossWeight').value) || 0;
    const netWeight = parseFloat(document.getElementById('netWeight').value) || 0;
    const karatValue = parseFloat(document.getElementById('karatValue').value) || 0;
    const articleName = getArticleName();
    const durationValue = getDuration();
    const durationText = getDurationText();
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const pawnValue = parseFloat(document.getElementById('pawnValue').value) || 0;
    const notes = document.getElementById('notes').value || '';

    if (netWeight <= 0 || karatValue <= 0 || !articleName || durationValue <= 0 || interestRate < 0 || pawnValue <= 0) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Please fill all required fields with valid values.',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!validateKaratValue()) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Karat value cannot exceed 24',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
        return;
    }

    const valuePerGram = pawnValue / 8;
    const goldValue = netWeight * valuePerGram;
    const interestAmount = (goldValue * interestRate * durationValue) / 100;
    const calculatedLoanAmount = goldValue - interestAmount;
    const dailyInterest = calculateDailyInterest(interestAmount, durationValue);
    const dueDate = calculateDueDate(durationValue);

    const article = {
        id: Date.now(),
        name: articleName,
        grossWeight: grossWeight,
        weight: netWeight,
        karat: karatValue,
        duration: durationValue,
        durationText: durationText,
        interestRate: interestRate,
        goldValue: goldValue,
        dailyInterest: dailyInterest,
        interest: interestAmount,
        calculatedLoan: calculatedLoanAmount,
        adjustedLoan: calculatedLoanAmount,
        adjustment: 0,
        dueDate: dueDate,
        notes: notes
    };

    articles.push(article);
    console.log(article);

    updateArticlesTable();
    resetPawingForm();

}

//validate Karrot value
function validateKaratValue() {
    const karatInput = document.getElementById('karatValue');
    const errorElement = document.getElementById('karatError') ||
        (() => {
            const div = document.createElement('div');
            div.id = 'karatError';
            div.className = 'error-message';
            karatInput.closest('.form-group').appendChild(div);
            return div;
        })();

    const isValid = karatInput.value <= 24;

    errorElement.textContent = isValid ? '' : 'Karat value cannot exceed 24';
    errorElement.style.display = isValid ? 'none' : 'block';
    karatInput.classList.toggle('input-error', !isValid);

    return isValid;
}


function resetPawingForm() {
    document.getElementById('grossWeight').value = '';
    document.getElementById('netWeight').value = '';
    document.getElementById('karatValue').value = '';

    const articleSelect = document.getElementById('articleSelect');
    const customArticle = document.getElementById('customArticle');
    const clearArticle = document.getElementById('clearArticle');
    articleSelect.style.display = 'block';
    customArticle.style.display = 'none';
    clearArticle.style.display = 'none';
    articleSelect.value = 'Necklace';
    customArticle.value = '';

    const durationSelect = document.getElementById('durationSelect');
    const customDuration = document.getElementById('customDuration');
    const clearDuration = document.getElementById('clearDuration');
    durationSelect.style.display = 'block';
    customDuration.style.display = 'none';
    clearDuration.style.display = 'none';
    durationSelect.value = '1';
    customDuration.value = '';

    document.getElementById('interestRate').value = '';
    document.getElementById('pawnValue').value = '';
    document.getElementById('notes').value = '';


    document.getElementById('nextBtn').disabled = false;
}


function updateArticlesTable() {
    const tableBody = document.getElementById('articlesTableBody');
    tableBody.innerHTML = '';

    totalGoldValueSum = 0;
    totalInterestSum = 0;
    totalCalculatedLoanSum = 0;
    totalAdjustedLoanSum = 0;
    totalAdjustmentSum = 0;

    articles.forEach(article => {
        const row = document.createElement('tr');
        row.dataset.id = article.id;

        const adjustedLoanInput = document.createElement('input');
        adjustedLoanInput.type = 'number';
        adjustedLoanInput.value = article.adjustedLoan.toFixed(2);
        adjustedLoanInput.className = 'adjustable-loan';
        adjustedLoanInput.dataset.id = article.id;
        adjustedLoanInput.addEventListener('change', function () {
            updateAdjustedLoanAmount(article.id, parseFloat(this.value) || 0);
        });

        const interestRateInput = document.createElement('input');
        interestRateInput.type = 'number';
        interestRateInput.value = article.interestRate;
        interestRateInput.className = 'adjustable-interest';
        interestRateInput.dataset.id = article.id;
        interestRateInput.addEventListener('change', function () {
            updateInterestRate(article.id, parseFloat(this.value) || 0);
        });

        const adjustmentCell = document.createElement('td');
        const adjustment = article.adjustment;
        if (adjustment > 0) {
            adjustmentCell.innerHTML = `<span class="positive-adjustment">+${adjustment.toFixed(2)}</span>`;
        } else if (adjustment < 0) {
            adjustmentCell.innerHTML = `<span class="negative-adjustment">${adjustment.toFixed(2)}</span>`;
        } else {
            adjustmentCell.innerHTML = `<span class="zero-adjustment">0.00</span>`;
        }

        row.innerHTML = `
        <td title="${article.notes ? 'Note: ' + article.notes : ''}">${article.name}</td>
        <td>${article.weight.toFixed(2)} g${article.grossWeight ? ' (Gross: ' + article.grossWeight.toFixed(2) + ' g)' : ''}</td>
        <td>${article.karat}K</td>
        <td>${article.durationText}</td>
        <td>${article.dueDate}</td>
        <td>LKR ${article.goldValue.toFixed(2)}</td>
        <td></td>
        <td>LKR ${article.dailyInterest.toFixed(2)}</td>
        <td>LKR ${article.interest.toFixed(2)}</td>
        <td>LKR ${article.calculatedLoan.toFixed(2)}</td>
        <td></td>
        <td></td>
        <td>
            <button class="btn-delete" data-id="${article.id}" data-name="${article.name}">Delete</button>
        </td>
    `;

        row.cells[6].appendChild(interestRateInput);
        row.cells[10].appendChild(adjustedLoanInput);
        row.cells[11].replaceWith(adjustmentCell);

        tableBody.appendChild(row);

        totalGoldValueSum += article.goldValue;
        totalInterestSum += article.interest;
        totalCalculatedLoanSum += article.calculatedLoan;
        totalAdjustedLoanSum += article.adjustedLoan;
        totalAdjustmentSum += article.adjustment;
    });

    document.getElementById('totalGoldValue').textContent = 'LKR ' + totalGoldValueSum.toFixed(2);
    document.getElementById('totalInterest').textContent = 'LKR ' + totalInterestSum.toFixed(2);
    document.getElementById('totalCalculatedLoan').textContent = 'LKR ' + totalCalculatedLoanSum.toFixed(2);
    document.getElementById('totalAdjustedLoan').textContent = 'LKR ' + totalAdjustedLoanSum.toFixed(2);

    const totalAdjustmentElement = document.getElementById('totalAdjustment');
    if (totalAdjustmentSum > 0) {
        totalAdjustmentElement.innerHTML = `<span class="positive-adjustment">+LKR ${totalAdjustmentSum.toFixed(2)}</span>`;
    } else if (totalAdjustmentSum < 0) {
        totalAdjustmentElement.innerHTML = `<span class="negative-adjustment">LKR ${totalAdjustmentSum.toFixed(2)}</span>`;
    } else {
        totalAdjustmentElement.innerHTML = `<span class="zero-adjustment">LKR 0.00</span>`;
    }

    document.getElementById('totalLoanPanel').style.display = articles.length > 0 ? 'block' : 'none';
}


function updateAdjustedLoanAmount(id, newValue) {
    const articleIndex = articles.findIndex(article => article.id === id);
    if (articleIndex === -1) return;

    const article = articles[articleIndex];
    article.adjustedLoan = newValue;
    article.adjustment = newValue - article.calculatedLoan;

    updateArticlesTable();
}


function updateInterestRate(id, newRate) {
    const articleIndex = articles.findIndex(article => article.id === id);
    if (articleIndex === -1) return;

    const article = articles[articleIndex];
    const currentAdjustedLoan = article.adjustedLoan;

    article.interestRate = newRate;
    article.interest = (article.goldValue * newRate * article.duration) / 100;
    article.dailyInterest = calculateDailyInterest(article.interest, article.duration);
    article.calculatedLoan = article.goldValue - article.interest;
    article.adjustedLoan = currentAdjustedLoan;
    article.adjustment = article.adjustedLoan - article.calculatedLoan;

    updateArticlesTable();
}

function deleteArticle(id) {
    articles = articles.filter(article => article.id !== id);
    updateArticlesTable();
    document.getElementById('nextBtn').disabled = articles.length === 0;
}

function resetForm() {
    resetPawingForm();
    articles = [];
    updateArticlesTable();
}

function goToNextPage() {
    // if (articles.length === 0) {
    //     Swal.fire({
    //         title: 'Invalid Input',
    //         text: 'Please add at least one article before proceeding.',
    //         icon: 'error',
    //         confirmButtonColor: '#d33',
    //         confirmButtonText: 'OK'
    //     });
    //     return;
    // }

    if (currentPage < 3) {
        document.getElementById('page' + currentPage).classList.remove('active');
        document.getElementById('step' + currentPage).classList.remove('active');

        currentPage++;

        document.getElementById('page' + currentPage).classList.add('active');
        document.getElementById('step' + currentPage).classList.add('active');

        updateProgressBar();
    }
}

function goToPreviousPage() {
    if (currentPage > 1) {
        document.getElementById('page' + currentPage).classList.remove('active');
        document.getElementById('step' + currentPage).classList.remove('active');

        currentPage--;

        document.getElementById('page' + currentPage).classList.add('active');
        document.getElementById('step' + currentPage).classList.add('active');

        updateProgressBar();
    }
}

function setPawningSummary(formData) {
    document.getElementById('summary-name').textContent = formData.customerName;
    document.getElementById('summary-gender').textContent = formData.gender;

    const fullAddress = formData.addressTwo ? `${formData.addressOne}, ${formData.addressTwo}` : formData.addressOne;
    document.getElementById('summary-address').textContent = fullAddress;

    document.getElementById('summary-nic').textContent = formData.nic;

    let contactInfo = formData.contactNumberOne;
    if (formData.contactNumberTwo) contactInfo += `, ${formData.contactNumberTwo}`;
    if (formData.email) contactInfo += ` / ${formData.email}`;
    document.getElementById('summary-contact').textContent = contactInfo;

    document.getElementById('summary-totalGoldValue').textContent = 'LKR ' + totalGoldValueSum.toFixed(2);
    document.getElementById('summary-totalInterest').textContent = 'LKR ' + totalInterestSum.toFixed(2);
    document.getElementById('summary-totalCalculatedValue').textContent = 'LKR ' + totalCalculatedLoanSum.toFixed(2);
    document.getElementById('summary-totalLoan').textContent = 'LKR ' + totalAdjustedLoanSum.toFixed(2);
}

async function handleCustomerSave() {

    if (validateCustomerForm()) {
        try {
            const formData = {
                customerName: document.getElementById('customerName').value.trim(),
                nic: document.getElementById('nic').value.trim(),
                addressOne: document.getElementById('address1').value.trim(),
                addressTwo: document.getElementById('address2').value.trim() || "",
                contactNumberOne: document.getElementById('phone1').value.trim(),
                contactNumberTwo: document.getElementById('phone2').value.trim() || "",
                email: document.getElementById('email').value.trim() || "",
                gender: document.getElementById('gender').value,
                status: "Active",
                customerId: currentCustomerId || ""
            };
            const savedData = await saveCustomerData(formData);

            if (savedData && savedData.customerId) {
                currentCustomerId = savedData.customerId;

                // console.log('Customer saved successfully:', savedData);
                // console.log('Articles to be associated:', articles);

                Swal.fire({
                    title: 'Success',
                    text: 'Customer information saved successfully.',
                    icon: 'success',
                    confirmButtonColor: '#FFC107',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        setPawningSummary(formData);
                        goToNextPage();
                    }
                });
                return true;
            }

        } catch (error) {
            console.error('Error saving customer:', error);

            Swal.fire({
                title: 'Error',
                text: 'Failed to save customer information. Please try again.',
                icon: 'error',
                confirmButtonColor: '#FFC107',
                confirmButtonText: 'OK'
            });
        }

    } else {
        Swal.fire({
            title: 'Validation Error',
            text: 'Please fix the errors in the form before proceeding.',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
        return false;
    }
}

async function handleCustomerFetch() {
    const nic = document.getElementById('nic').value;
    if (!nic) return;

    try {

        const customerData = await fetchCustomerByNIC(nic);

        if (customerData) {
            currentCustomerId = customerData.customerId;

            document.getElementById('customerName').value = customerData.customerName || '';
            document.getElementById('address1').value = customerData.addressOne || '';
            document.getElementById('address2').value = customerData.addressTwo || '';
            document.getElementById('phone1').value = customerData.contactNumberOne || '';
            document.getElementById('phone2').value = customerData.contactNumberTwo || '';
            document.getElementById('email').value = customerData.email || '';
            document.getElementById('gender').value = customerData.gender || 'Male';


            validateCustomerForm();

        }
    } catch (error) {
        console.error("Error fetching customer:", error);


        currentCustomerId = null;
        document.getElementById('customerName').value = '';
        document.getElementById('address1').value = '';
        document.getElementById('address2').value = '';
        document.getElementById('phone1').value = '';
        document.getElementById('phone2').value = '';
        document.getElementById('email').value = '';
        document.getElementById('gender').value = 'Male';

        Swal.fire({
            title: 'Customer Not Found',
            text: 'No customer found with the provided NIC number.',
            icon: 'info',
            confirmButtonColor: '#FFC107',
            confirmButtonText: 'OK'
        });
    }

    return currentCustomerId;
}



async function handlePawnSave() {
    try {

        const pawningItems = articles.map(item => {
            return {
                customerId: currentCustomerId || "",
                article: item.name,
                adjustableValue: parseFloat(item.adjustment || 0),
                assetValue: parseFloat(item.calculatedLoan || 0),
                monthlyInterest: parseFloat(item.interestRate || 0),
                karatValue: item.karat + "K",
                expiryDate: formatDateToISO(item.dueDate),
                createdDate: getCurrentDateISO(),
                netWeight: parseFloat(item.weight || 0),
                grossWeight: parseFloat(item.grossWeight || 0),
                loanAmount: parseFloat(item.adjustedLoan || 0),
                dailyInterest: parseFloat(item.dailyInterest || 0),
                interestAmount: parseFloat(item.interest || 0),
                note: item.notes || "",
                status: "Pending"
            };
        });


        const totalLoanText = document.getElementById('summary-totalLoan').textContent;
        const totalAssetText = document.getElementById('summary-totalCalculatedValue').textContent;

        const totalLoanAmount = parseFloat(totalLoanText.replace('LKR ', ''));
        const totalAssetValue = parseFloat(totalAssetText.replace('LKR ', ''));


        const pawningData = {
            ticketId: 0,
            customerId: currentCustomerId || "",
            pawningDate: getCurrentDateISO(),
            totalLoanAmount: totalLoanAmount,
            totalAssetValue: totalAssetValue,
            status: "ACTIVE",
            pawningItemsDTOS: pawningItems
        };


        const result = await savePawningData(pawningData);

        Swal.fire({
            title: 'Success',
            text: 'Pawning data saved successfully!',
            icon: 'success',
            confirmButtonColor: '#FFC107',
            confirmButtonText: 'OK'
        });

        return true;
    } catch (error) {
        console.error('Error saving pawning data:', error);

        Swal.fire({
            title: 'Error',
            text: 'Failed to save pawning data. Please try again.',
            icon: 'error',
            confirmButtonColor: '#FFC107',
            confirmButtonText: 'OK'
        });

        return false;
    }
}


function getCurrentDateISO() {
    return new Date().toISOString();
}


function formatDateToISO(dateString) {
    return new Date(dateString).toISOString();
}


function clearCustomerFields() {
    document.getElementById('customerName').value = '';
    document.getElementById('address1').value = '';
    document.getElementById('address2').value = '';
    document.getElementById('phone1').value = '';
    document.getElementById('phone2').value = '';
    document.getElementById('email').value = '';
    document.getElementById('gender').value = 'Male';


    const errorFields = ['nic', 'customerName', 'address1', 'address2', 'phone1', 'phone2', 'email', 'gender'];
    errorFields.forEach(fieldId => {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        const inputElement = document.getElementById(fieldId);
        if (inputElement) {
            inputElement.classList.remove('input-error');
        }
    });

    currentCustomerId = null;
}


const receiptsContainer = document.getElementById('receipts');

async function generateReceipts() {
    receiptsContainer.innerHTML = '';

    try {
        const data = await fetchTicketData();
        if (data && data.data && data.data.length > 0) {
            createReceiptPages(data.data);
        } else {
            receiptsContainer.innerHTML = '<p>No data found for this customer.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        receiptsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}


  function createReceiptPages(items) {
      // Calculate number of pages needed (2 items per page)
      const itemsPerPage = 2;
      const totalPages = Math.ceil(items.length / itemsPerPage);

      for (let page = 0; page < totalPages; page++) {
        // Get items for this page
        const startIdx = page * itemsPerPage;
        const pageItems = items.slice(startIdx, startIdx + itemsPerPage);

        // Create page element
        const pageElement = document.createElement('div');
        pageElement.className = 'receipt-page';

        // Add page content
        pageElement.innerHTML = createPageContent(pageItems, page + 1, totalPages, items);

        // Add to container
        receiptsContainer.appendChild(pageElement);
      }
    }


 function createPageContent(items, pageNumber, totalPages, allItems) {
    // Extract customer info from first item (all items should have the same customer info)
    const customerInfo = items[0];

    // Calculate totals
    const pageTotalLoan = items.reduce((sum, item) => sum + item.loanAmount, 0);

    const pageTotalWeight = items.reduce((sum, item) => sum + item.netWeight, 0);


    const createdDate = formatDate(customerInfo.createdDate);
    const expiryDate = formatDate(customerInfo.expiryDate);

    let html = `
    <div class="receipt-content">
      
      <div class="receipt-info">
        <div class="date" style="position: absolute; left: 60m; top: 14mm;"><strong>${createdDate}</strong></div>
        <div class="bill-no" style="position: absolute; left: 23mm; top: 23mm;"><strong>${customerInfo.ticketNo}</strong></div>
        <div class="time" style="position: absolute; left: 150mm; top: 24mm;">${new Date().toLocaleTimeString()}</div>
      </div>

      <div class="main-content">
        <div class="customer-section">
          <div class="name-address" style="position: absolute; left: -5mm; top: 41mm;">
            <div class="cusname"><strong>${customerInfo.customerName}</strong></div>
            <div class="cusaddress">${customerInfo.customerAddressOne}</div>
          </div>
          <div class="nic" style="position: absolute; left: 42mm; top: 64mm;">${customerInfo.customerNic}</div>
          <div class="tel-no" style="position: absolute; left: 32mm; top: 71mm;">
            ${customerInfo.customerContactOne}
          </div>
        </div>

        <div class="items-section" style="position: absolute; left: 90mm; top: 38mm;">
          <div class="items-table">
            <div class="items-body">
    `;

   
    items.forEach((item, index) => {
        html += `
              <div class="item-row" style="position: absolute; left: 0mm; top: ${(index + 1) * 7}mm;">
                <div class="item-col" style="position: absolute; left: 0mm;"><strong>${item.article}</strong></div>
                <div class="weight-col" style="position: absolute; left: 26mm;"><strong>${item.netWeight}</strong></div>
                <div class="gold-content-col" style="position: absolute; left: 45mm;"><strong>18-22KT</strong></div>
              </div>
        `;
    });

    html += `
              <div class="total-weight" style="position: absolute; left: 44mm; top:30mm;">
                <strong>${formatNumber(pageTotalWeight)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-section">
        <div class="amount-section" style="position: absolute; left: 15mm; top: 80mm;">
          <div><strong>${formatCurrency(pageTotalLoan)}</strong></div>
        
        </div>

        <div class="period-section" style="position: absolute; left: 75mm; top: 80mm;">
          <div><strong>12 months</strong></div>
        </div>

        <div class="redemption-section" style="position: absolute; left: 157mm; top: 80mm;">
          <div><strong>${expiryDate}</strong></div>
        </div>

        <div class="gold-loan-advance" style="position: absolute; left: 40mm; top: 100mm;">
         
        </div>
      </div>


      <div class="page-number">
        ${pageNumber} of ${totalPages}
      </div>
    </div>
    `;

    return html;
}

    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    function formatCurrency(amount) {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function formatNumber(num) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
    }

    function printReceipts() {
        console.log("print");
        window.print();
    }
























document.addEventListener('DOMContentLoaded', () => {

    const karatInput = document.getElementById('karatValue');
    const addItemBtn = document.querySelector('.btn-next:not(#nextBtn)');
    const resetBtn = document.querySelector('.btn-secondary');
    const articlesTableBody = document.getElementById('articlesTableBody');
    const nextBtn = document.getElementById('nextBtn');
    const previousBtn = document.querySelector(".btn-previous");
    const previousToCusBtn = document.getElementById('prevBtn2')
    const printButton = document.getElementById('printReceiptBtn');

    const nicInput = document.getElementById('nic');
    const customerNameInput = document.getElementById('customerName');
    const address1Input = document.getElementById('address1');
    const address2Input = document.getElementById('address2');
    const phone1Input = document.getElementById('phone1');
    const phone2Input = document.getElementById('phone2');
    const emailInput = document.getElementById('email');
    const genderSelect = document.getElementById('gender');
    const nextSummaryBtn = document.getElementById('btn-next-summary');
    const arrowButton = document.getElementById('arrow-button');
    const printReceiptBtn=document.getElementById('print-btn')

 

    

  
    

    if (addItemBtn) {
        addItemBtn.addEventListener('click', calculateAndAddItem);
    } else {
        console.log('Add Article button not found');
    }

    if (karatInput) {
        karatInput.addEventListener('input', validateKaratValue);
    } else {
        console.log('karatValue input not found');
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextPage);
    } else {
        console.log('Next button not found');
    }

    if (previousBtn) {
        previousBtn.addEventListener('click', goToPreviousPage);
    } else {
        console.log('previous button not found');
    }

    if (previousToCusBtn) {
        previousToCusBtn.addEventListener('click', goToPreviousPage);
    } else {
        console.log('next button not found');
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Are you sure?',
                text: 'Clear all form inputs.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#FFC107',
                confirmButtonText: 'Yes, reset',
                cancelButtonText: 'Cancel',
                customClass: {
                    cancelButton: 'btn-secondary'
                },
                buttonsStyling: true
            }).then((result) => {
                if (result.isConfirmed) {
                    resetForm();
                    Swal.fire({
                        title: 'Success',
                        text: 'All form data and articles have been cleared.',
                        icon: 'success',
                        confirmButtonColor: '#FFC107',
                        confirmButtonText: 'OK'
                    });
                }
                nextBtn.disabled = true;
            });
        });
    } else {
        console.log('Reset button not found');
    }



    if (articlesTableBody) {
        articlesTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const articleId = parseInt(e.target.dataset.id, 10);
                const articleName = e.target.dataset.name;

                if (!isNaN(articleId)) {
                    Swal.fire({
                        title: 'Are you sure?',
                        html: `You are about to remove <strong>${articleName}</strong>.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#FFC107',
                        confirmButtonText: 'Yes, remove it',
                        cancelButtonText: 'Cancel',
                        customClass: {
                            cancelButton: 'btn-secondary'
                        },
                        buttonsStyling: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            deleteArticle(articleId);
                            Swal.fire({
                                title: 'Success',
                                text: 'The article has been successfully removed.',
                                icon: 'success',
                                confirmButtonColor: '#FFC107',
                                confirmButtonText: 'OK'
                            });
                        }
                    });
                }
            }
        });
    } else {
        console.log('Articles table body not found');
    }



    if (nicInput) {
        nicInput.addEventListener('input', validateNICField);
        nicInput.addEventListener('blur', validateNICField);
    }

    if (customerNameInput) {
        customerNameInput.addEventListener('input', validateCustomerNameField);
        customerNameInput.addEventListener('blur', validateCustomerNameField);
    }

    if (address1Input) {
        address1Input.addEventListener('input', validateAddress1Field);
        address1Input.addEventListener('blur', validateAddress1Field);
    }

    if (address2Input) {
        address2Input.addEventListener('input', validateAddress2Field);
        address2Input.addEventListener('blur', validateAddress2Field);
    }

    if (phone1Input) {
        phone1Input.addEventListener('input', validatePhone1Field);
        phone1Input.addEventListener('blur', validatePhone1Field);
    }

    if (phone2Input) {
        phone2Input.addEventListener('input', validatePhone2Field);
        phone2Input.addEventListener('blur', validatePhone2Field);
    }

    if (emailInput) {
        emailInput.addEventListener('input', validateEmailField);
        emailInput.addEventListener('blur', validateEmailField);
    }

    if (genderSelect) {
        genderSelect.addEventListener('change', validateGenderField);
    }

    if (arrowButton) {
        arrowButton.addEventListener('click', function () {
            if (validateNICField()) {
                handleCustomerFetch();

            }
        });
    }


    if (nextSummaryBtn) {
        nextSummaryBtn.addEventListener('click', function (event) {
            if (!validateCustomerForm()) {
                event.preventDefault();
                Swal.fire({
                    title: 'Validation Error',
                    text: 'Please fix the errors in the form before proceeding.',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            } else {
                handleCustomerSave()


            }
        });
    }


    if (printButton) {
        printButton.addEventListener('click', async function (event) {
            event.preventDefault();
            try {
                const isSaved = await handlePawnSave();
                if (isSaved) {
                   
                receiptsContainer.innerHTML = '';
                    
                    await generateReceipts();
               
                }
            } catch (error) {
                console.error('Error in print process:', error);
                Swal.fire({
                    title: 'Print Error',
                    text: 'An error occurred during printing. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keydown', function (e) {
            if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
            }
        });
    });



    if (nicInput) {
        nicInput.addEventListener('input', function (event) {

            if (event.target.value.trim() === '') {
                clearCustomerFields();
            } else {
                validateNICField();
            }
        });


        nicInput.addEventListener('blur', validateNICField);
    }

    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', printReceipts);
    } else {
        console.log('previous button not found');
    }


    // function printReceipts() {
    //     const receiptsContainer = document.getElementById('receipts');
       
    
    //     if (!receiptsContainer || receiptsContainer.children.length === 0) {
    //         alert('No receipts to download. Please generate receipts first.');
    //         return;
    //     }
    
      
    
    //     let ticketNo = 'receipt';
    //     try {
    //         const ticketElement = [...receiptsContainer.querySelectorAll('.customer-info-row')]
    //             .find(el => el.textContent.includes('Ticket #:'));
    //         if (ticketElement) {
    //             ticketNo = ticketElement.textContent.split(':')[1].trim();
    //         }
    //     } catch (error) {
    //         console.log('Could not extract ticket number, using default filename');
    //     }
    
    //     const options = {
    //         margin: 10,
    //         filename: `${ticketNo}_${new Date().toISOString().slice(0, 10)}.pdf`,
    //         image: { type: 'jpeg', quality: 0.98 },
    //         html2canvas: { 
    //             scale: 2,
    //             useCORS: true,
    //             letterRendering: true,
    //             allowTaint: true
    //         },
    //         jsPDF: { 
    //             unit: 'mm', 
    //             format: [216, 140], // Custom size: ~8.5x5.5 inches in mm (216mm x 140mm)
    //             orientation: 'portrait' 
    //         }
    //     };
    
    //     // Generate and download PDF
    //     html2pdf()
    //         .from(receiptsContainer)
    //         .set(options)
    //         .save()
    //         .then(() => {
    //             // Return a blob URL for preview
    //             return html2pdf()
    //                 .from(receiptsContainer)
    //                 .set(options)
    //                 .outputPdf('bloburl');
    //         })
    //         .then((pdfBlobUrl) => {
              
    //             window.open(pdfBlobUrl); // Open preview in new tab
    //         })
    //         .catch(error => {
    //             console.error('Error generating PDF:', error);
    //             alert('Error generating PDF. Please try again.');
                
    //         });
    // }
});


