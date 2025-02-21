import fs from 'fs';
import readline from 'readline';

type username = string;
type tweet = string;
type user = {
    account: username;
    tweets: tweet[];
}

async function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter Twitter username: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function fetchUserTweets(username: username): Promise<user> {
    const baseUrl = 'https://fabxmporizzqflnftavs.supabase.co/storage/v1/object/public/archives';
    const response = await fetch(`${baseUrl}/${username.toLowerCase()}/archive.json`);

    if (!response.ok) {
        throw new Error(`Failed to fetch tweets for user ${username}`);
    }

    const data = await response.json();
    return {
        account: username,
        tweets: Object.values(data.tweets)
    };
}

async function saveTweetsToJson(username: string): Promise<void> {
    try {
        const userData = await fetchUserTweets(username);

        // Create a formatted dataset suitable for LLM training
        const trainingData = {
            author: userData.account,
            tweets: userData.tweets.map(tweet => ({
                content: tweet,
                // You can add additional metadata here if needed
            }))
        };

        // Log the tweets data
        // console.log('Tweets:', JSON.stringify(trainingData, null, 2));

        // Ensure the output directory exists
        const outputDir = './training_data';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Save to JSON file
        const outputPath = `${outputDir}/${username}_tweets.json`;
        fs.writeFileSync(
            outputPath,
            JSON.stringify(trainingData, null, 2)
        );

        console.log(`Successfully saved tweets for ${username} to ${outputPath}`);
    } catch (error) {
        console.error(`Error saving tweets for ${username}:`, error);
        throw error;
    }
}

// Main function to run the script
async function main() {
    try {
        const username = await getUserInput();
        await saveTweetsToJson(username);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the script if this file is executed directly
if (require.main === module) {
    main();
}

export { fetchUserTweets, saveTweetsToJson };
