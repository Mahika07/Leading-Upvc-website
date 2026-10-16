
export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }

    const accessKey = process.env.CONTACT_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
        return res.status(500).json({
            success: false,
            message: "CONTACT_WEB3FORMS_ACCESS_KEY is missing in Vercel.",
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

        const upstream = await fetch("https://api.web3forms.com/submit", {
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

        const raw = await upstream.text();

        let result;
        try {
            result = JSON.parse(raw);
        } catch {
            console.error(
                "Web3Forms returned non-JSON:",
                upstream.status,
                raw.slice(0, 300)
            );

            return res.status(502).json({
                success: false,
                message: `Web3Forms returned an unexpected response (HTTP ${upstream.status}). Check Vercel logs.`,
            });
        }

        if (!upstream.ok || !result.success) {
            console.error("Web3Forms rejected enquiry:", upstream.status, result);

            return res.status(502).json({
                success: false,
                message: result.message || "Web3Forms rejected the enquiry.",
            });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Enquiry submission failed:", error);

        return res.status(502).json({
            success: false,
            message: "Unable to contact the enquiry service.",
        });
    }
}
