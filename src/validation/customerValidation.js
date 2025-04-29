
export function validateNIC(nic) {
    if (!nic) return 'NIC required';
    if (!/^(?:\d{9}[VvXx]|\d{12})$/.test(nic)) {
        return 'NIC must be 9 digits ending with V or 12 digits';
    }
    return '';
}

export function validateName(name) {
    if (!name) return 'Name required';
    if (!/^[A-Za-z\s\.\-]+$/.test(name)) {
        return 'Name can only contain letters, spaces, dots, and hyphens';
    }
    if (name.length < 2) return 'Name too short (min 2 chars)';
    if (name.length > 100) return 'Name too long (max 100 chars)';
    return '';
}

export function validateAddress1(address) {
    if (!address) return 'Address required';
    if (address.length < 5) return 'Address too short (min 5 chars)';
    if (address.length > 200) return 'Address too long (max 200 chars)';
    return '';
}

export function validateAddress2(address) {
    if (!address) return ''; 
    if (address.length > 200) return 'Address too long (max 200 chars)';
    return '';
}

export function validatePhone(phone, isRequired = true) {
    if (!phone && !isRequired) return '';
    if (!phone) return 'Phone required';
    if (!/^(?:\+94|0)(?:7[0-8])\d{7}$/.test(phone)) {
        return 'Phone must be +947XYYYYYYY or 07XYYYYYYY';
    }
    return '';
}

export function validateEmail(email) {
    if (!email) return ''; 
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Invalid email';
    }
    return '';
}

export function validateGender(gender) {
    if (!gender) return 'Gender required';
    if (!['Male', 'Female', 'Other'].includes(gender)) {
        return 'Select Male, Female, or Other';
    }
    return '';
}

export function getErrorElement(fieldId) {
    let errorElement = document.getElementById(`${fieldId}-error`);
    if (!errorElement) {
        const inputElement = document.getElementById(fieldId);
        if (!inputElement) return null;
        
        errorElement = document.createElement('p');
        errorElement.id = `${fieldId}-error`;
        errorElement.className = 'error-message';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.margin = '5px 0 0 0';
        errorElement.style.padding = '0';
    
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
    return errorElement;
}


export function displayValidationResult(fieldId, errorMessage) {
    const inputElement = document.getElementById(fieldId);
    const errorElement = getErrorElement(fieldId);
    
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = errorMessage ? 'block' : 'none';
    }
    
    if (inputElement) {
        inputElement.classList.toggle('input-error', !!errorMessage);
    }
    
    return !errorMessage; 
}


export function validateNICField() {
    const nic = document.getElementById('nic').value.trim();
    const errorMessage = validateNIC(nic);
    return displayValidationResult('nic', errorMessage);
}

export function validateCustomerNameField() {
    const name = document.getElementById('customerName').value.trim();
    const errorMessage = validateName(name);
    return displayValidationResult('customerName', errorMessage);
}

export function validateAddress1Field() {
    const address = document.getElementById('address1').value.trim();
    const errorMessage = validateAddress1(address);
    return displayValidationResult('address1', errorMessage);
}

export function validateAddress2Field() {
    const address = document.getElementById('address2').value.trim();
    const errorMessage = validateAddress2(address);
    return displayValidationResult('address2', errorMessage);
}

export function validatePhone1Field() {
    const phone = document.getElementById('phone1').value.trim();
    const errorMessage = validatePhone(phone, true); 
    return displayValidationResult('phone1', errorMessage);
}

export function validatePhone2Field() {
    const phone = document.getElementById('phone2').value.trim();
    const errorMessage = validatePhone(phone, false);
    return displayValidationResult('phone2', errorMessage);
}

export function validateEmailField() {
    const email = document.getElementById('email').value.trim();
    const errorMessage = validateEmail(email);
    return displayValidationResult('email', errorMessage);
}

export function validateGenderField() {
    const gender = document.getElementById('gender').value;
    const errorMessage = validateGender(gender);
    return displayValidationResult('gender', errorMessage);
}


export function validateCustomerForm() {
    const nicValid = validateNICField();
    const nameValid = validateCustomerNameField();
    const address1Valid = validateAddress1Field();
    const address2Valid = validateAddress2Field();
    const phone1Valid = validatePhone1Field();
    const phone2Valid = validatePhone2Field();
    const emailValid = validateEmailField();
    const genderValid = validateGenderField();
    
    return nicValid && nameValid && address1Valid && address2Valid && 
           phone1Valid && phone2Valid && emailValid && genderValid;
}