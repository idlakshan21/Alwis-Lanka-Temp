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
