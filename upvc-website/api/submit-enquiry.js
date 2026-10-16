
export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const accessKey = process.env.CONTACT_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
        return res.status(500).json({
            success: false,
            message: "Form configuration is missing.",
        });
    }

    try {
        const data = req.body;

        if (!data || typeof data !== "object" || Array.isArray(data)) {
            return res.status(400).json({
                success: false,
                message: "Invalid form data.",
            });
        }

        const { access_key, ...formData } = data;

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                ...formData,
                access_key: accessKey,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            return res.status(502).json({
                success: false,
                message: result.message || "Unable to send your enquiry.",
            });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Enquiry submission failed:", error);

        return res.status(502).json({
            success: false,
            message: "Unable to send your enquiry. Please try again.",
        });
    }
}
