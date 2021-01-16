export default function unlocalize(strNum) {
    function getSeparator(separatorType, locale) {
        const numberWithGroupAndDecimalSeparator = 1000.1;
        return Intl.NumberFormat(locale)
            .formatToParts(numberWithGroupAndDecimalSeparator)
            .find(part => part.type === separatorType)
            .value;
    }
    const groupSeparator = getSeparator('group')
    const decimalSeparator = getSeparator('decimal')
    // hack to handle mathjs inability to work with locale formatted numbers
    return strNum.replace(/\s+/g, '').replaceAll(groupSeparator, '').replaceAll(decimalSeparator, '.')
}