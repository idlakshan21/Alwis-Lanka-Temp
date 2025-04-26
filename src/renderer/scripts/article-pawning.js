
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



let articles = [];
let totalGoldValueSum = 0;
let totalInterestSum = 0;
let totalCalculatedLoanSum = 0;
let totalAdjustedLoanSum = 0;
let totalAdjustmentSum = 0;
let currentPage = 1;


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

function postCustomerData() {
    // This is where you might post customer data after validation
    if (validateCustomerForm()) {
  
        console.log("Customer form validated successfully");
      
        return true;
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


document.addEventListener('DOMContentLoaded', () => {

    const karatInput = document.getElementById('karatValue');
    const addItemBtn = document.querySelector('.btn-next:not(#nextBtn)');
    const resetBtn = document.querySelector('.btn-secondary');
    const articlesTableBody = document.getElementById('articlesTableBody');
    const nextBtn = document.getElementById('nextBtn');
    const previousBtn = document.querySelector(".btn-previous");

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
        arrowButton.addEventListener('click', function() {
            if (validateNICField()) {
               
                console.log("NIC validated, fetching customer data...");
             
            }
        });
    }
    
  
    if (nextSummaryBtn) {
        nextSummaryBtn.addEventListener('click', function(event) {
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
                goToNextPage();
               
            }
        });
    }
});