const stripe = Stripe('YOUR_PUBLIC_STRIPE_KEY');

async function fetchUserData() {
    const response = await fetch('/user');
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    return response.json();
}

document.addEventListener('DOMContentLoaded', async function() {
    const usernameElement = document.getElementById('username');
    try {
        const userData = await fetchUserData();
        if (userData && userData.username) {
            usernameElement.textContent = `Logged in as: ${userData.username}`;
        } else {
            usernameElement.textContent = 'Not logged in';
        }

        const checkoutButton = document.getElementById('checkout-button');
        checkoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: userData.username })
                });

                const sessionId = await response.json();
                const { error } = await stripe.redirectToCheckout({ sessionId: sessionId.id });

                if (error) {
                    alert(error.message);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        });
    } catch (error) {
        console.error(error);
        usernameElement.textContent = 'Not logged in'; 
    }
});