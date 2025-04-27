const baseURL = window.env.BASE_URL;
//console.log("Base URL", baseURL);

export async function fetchCustomerByNIC(nic) {
    if (!nic) return null;

    const response = await fetch(`${baseURL}/customer?nic=${nic}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch customer data");
    }

    const responseData = await response.json();

    if (responseData && responseData.data) {
        return responseData.data;
    } else {
        throw new Error("Customer not found");
    }
}

export async function saveCustomerData(customerData) {
    const response = await fetch(`${baseURL}/customer/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
    });
    
    if (!response.ok) {
        throw new Error("Failed to save customer data");
    }
    
    const responseData = await response.json();
    
    if (responseData && responseData.code === 200) {
        return responseData.data;
    } else {
        throw new Error("Failed to save customer");
    }
}


export async function savePawningData(pawningData) {
    const response = await fetch(`${baseURL}/ticket/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pawningData)
    });
    
    if (!response.ok) {
        throw new Error("Failed to save pawning data");
    }
    
    const responseData = await response.json();
    
    if (responseData && responseData.code === 200) {
        return responseData.data;
    } else {
        throw new Error("Failed to save pawning data");
    }
}