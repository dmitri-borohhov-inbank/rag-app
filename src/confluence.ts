import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();
const confluenceBaseUrl = 'https://confluence.inbank.eu/rest/api';
const personalAccessToken = process.env.CONFLUENCE_TOKEN;

export const getPageContent = async (pageId: string) => {
    try {
        const response = await axios.get(
            `${confluenceBaseUrl}/content/${pageId}?expand=body.storage`,
            {
                headers: {
                    'Authorization': `Bearer ${personalAccessToken}`,
                    'Accept': 'application/json',
                },
            }
        );

        const pageData = response.data;
        const pageTitle = pageData.title;
        const pageContent = pageData.body.storage.value;
        return pageTitle + pageContent
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
        } else {
            // @ts-ignore
            console.error('Error:', error.message);
        }
    }
};