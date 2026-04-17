require('dotenv').config();
const http = require("http");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const API_URL = process.env.API_URL;

let lastGiveawayId = null;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Giveaway Bot is running!');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function sendGiveaway() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data || data.length === 0) return;

        console.log(data);

        const {id,title,worth,status,type,platforms,open_giveaway,thumbnail,image,description,instructions} = data[0];

        if (id === lastGiveawayId) {
            console.log("No new giveaway found.");
            return;
        }

        const embed = {
            title: `New Giveaway: ${title}`,
            url: open_giveaway,
            description: description,
            color: 15844367,
            thumbnail: {
                url: thumbnail
            },
            image: {
                url: image
            },
            fields: [
                {
                    name: "Instructions",
                    value: instructions,
                    inline: false
                },
                {
                    name: "Worth",
                    value: `~~${worth}~~ $0.00`,
                    inline: true
                },
                {
                    name: "Platforms",
                    value: platforms,
                    inline: true
                },
                {
                    name: "Status",
                    value: status,
                    inline: true
                },
                {
                    name: "Type",
                    value: type,
                    inline: true
                }
            ],
        }

        const discordResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });

        console.log('Giveaway sent to Discord successfully!');

        if (!discordResponse.ok) {
            console.error('Failed to send giveaway to Discord:', discordResponse.statusText);
        }else {
            lastGiveawayId = id;
            console.log("Message sent and ID saved to memory.");
        };

    } catch (error) {
        console.error('Error fetching giveaway or sending to Discord:', error);
    }
}

sendGiveaway();

setInterval(sendGiveaway,30000);
