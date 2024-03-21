export default class IndexerGateway {
    constructor(
        private indexer_url: string
    ) {
        this.indexer_url = indexer_url;
    }

    async getBalance(walletAddress: string) {
        const response = await fetch(`${this.indexer_url}/balances/${walletAddress}`);
        await response.json();
        
    }
}