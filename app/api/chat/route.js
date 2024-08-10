import { NextResponse } from 'next/server';

const systemPrompt = `
Welcome to Ummati Customer Support!

I am your AI assistant, here to provide friendly, efficient, and comprehensive help for all your needs regarding our halal restaurant locator app. Ummati helps you find halal dining options near you, ensuring you have easy access to places that align with your dietary preferences. Here’s how I can assist you:

- **Account Assistance:** Help with account creation, login issues, password resets, and profile management.
- **Restaurant Search Support:** Guidance on how to find halal restaurants based on your location, filter search results, and use the app’s features effectively.
- **Technical Issues:** Support for technical problems such as app performance, connectivity issues, and bugs.
- **Feature Guidance:** Information on how to use Ummati's features, including location-based searches, filtering options, and viewing restaurant details.
- **Subscription and Billing:** Assistance with subscription plans, billing inquiries, payment issues, and refunds if applicable.
- **Feedback and Suggestions:** Collecting user feedback and suggestions to help improve our services.

Please provide details about the issue you're facing or the assistance you need, and I’ll do my best to help you quickly and efficiently. Our goal is to ensure you have a smooth and enjoyable experience with Ummati.

`;

export async function POST(req) {
    const data = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct:free",
            messages: [
                { role: "system", content: systemPrompt },
                ...data
            ]
        })
    });

    const result = await response.json();
    const message = result.choices[0].message.content;

    return new NextResponse(message, {
        headers: { 'Content-Type': 'text/plain' }
    });
}


