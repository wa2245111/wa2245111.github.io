export default {
    /**
     *
     * @param value 钱（单位分）
     * @returns {string}
     */
    formatGermanyMoney: (value) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value/100);
    }
}
