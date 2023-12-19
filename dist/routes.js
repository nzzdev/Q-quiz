import Ajv from 'ajv';
import Boom from '@hapi/boom';
import { formatLocale as formatLocale$1 } from 'd3-format';
import CountryFlags from '@nzz/et-utils-country-flags';
import * as simpleStatistics from 'simple-statistics';
import { readFileSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function getExactPixelWidth(toolRuntimeConfig) {
    if (!toolRuntimeConfig.size || !Array.isArray(toolRuntimeConfig.size.width)) {
        return undefined;
    }
    for (const width of toolRuntimeConfig.size.width) {
        if (width && width.value && width.comparison === '=' && (!width.unit || width.unit === 'px')) {
            return width.value;
        }
    }
    return undefined;
}

const fourPerEmSpace = '\u2005';
const enDash = '\u2013';
// Formatting for numbers of >= 10000.
const formatLocale = formatLocale$1({
    currency: ['€', ''],
    decimal: ',',
    grouping: [3],
    minus: enDash,
    thousands: fourPerEmSpace,
});
// Formatting for numbers of <= 10000.
const formatLocaleSmall = formatLocale$1({
    currency: ['€', ''],
    decimal: ',',
    grouping: [10],
    minus: enDash,
    thousands: fourPerEmSpace,
});
const formatWithGroupingSeparator = formatLocale.format(',');
const formatNoGroupingSeparator = formatLocaleSmall.format('');
/**
 * This is the most important function.
 * It takes in the raw data from the user input and transform it into
 * a structure we can use for our components.
 */
function formatTableData(dataWithHeader, footnotes, options) {
    const header = [];
    const rows = [];
    const columns = [];
    // First get the type of each column.
    const columnMetadata = getColumnsType(dataWithHeader);
    const formatting = options.formatting || [];
    const sortingOptions = options.sorting || [];
    const formattingMap = {};
    formatting.forEach(f => {
        formattingMap[f.column] = f;
    });
    // Format the header.
    for (let colIndex = 0; colIndex < dataWithHeader[0].length; colIndex++) {
        const sortableOption = sortingOptions.find(d => d.column === colIndex);
        let sortable = false;
        let sortDirection = null;
        if (sortableOption) {
            sortable = true;
            sortDirection = sortableOption.sortingDirection;
        }
        header.push({
            value: dataWithHeader[0][colIndex] || '',
            type: columnMetadata[colIndex].type,
            sortable,
            sortDirection,
            classes: [],
            footnote: footnotes.get(`-1-${colIndex}`) || '',
        });
        // Create column arrays.
        // easier so we don't have to do if checks later.
        columns[colIndex] = [];
    }
    // Go through each row and create the correct cell.
    // note: start at index 1 to skip header.
    for (let rowIndex = 1; rowIndex < dataWithHeader.length; rowIndex++) {
        const row = dataWithHeader[rowIndex];
        const normalizedRowIndex = rowIndex - 1; // without header row.
        const cells = row.map((rawCellValue, colIndex) => {
            var _a;
            const formatting = (_a = formattingMap[colIndex]) === null || _a === void 0 ? void 0 : _a.formattingType;
            const type = columnMetadata[colIndex].type;
            const useGroupingSeparator = columnMetadata[colIndex].useGroupingSeparatorForNumbers;
            let cell;
            if (formatting) {
                cell = formatCell(rawCellValue, formatting, useGroupingSeparator);
            }
            else {
                switch (type) {
                    case 'numeric':
                        cell = formaticNumericData(rawCellValue, useGroupingSeparator);
                        break;
                    case 'text':
                    default:
                        cell = formatTextualData(rawCellValue);
                        break;
                }
            }
            columns[colIndex].push(cell);
            cell.footnote = footnotes.get(`${normalizedRowIndex}-${colIndex}`) || '';
            return cell;
        });
        rows.push({
            key: normalizedRowIndex,
            cells,
        });
    }
    return {
        header,
        rows,
        columns,
    };
}
function formatCell(rawValue, type, useGroupingSeparator = false) {
    let label = '';
    if (type === 'country_flags') {
        return formatCountryFlagDatapoint(rawValue);
    }
    const parsedRawValue = parseFloat(rawValue || '');
    if (isNaN(parsedRawValue)) {
        return {
            type: 'text',
            value: parsedRawValue,
            label: '',
            footnote: '',
            classes: [''],
        };
    }
    let prefix = '';
    let separator = '';
    if (useGroupingSeparator) {
        separator = ',';
    }
    switch (type) {
        case '0':
            label = formatLocale.format(`${separator}.0f`)(parsedRawValue);
            break;
        case '0.00':
            label = formatLocale.format(`${separator}.2f`)(parsedRawValue);
            break;
        case '0.000':
            label = formatLocale.format(`${separator}.3f`)(parsedRawValue);
            break;
        case '0%':
            label = formatLocale.format(`${separator}.0f`)(parsedRawValue) + '%';
            break;
        case '0.0%':
            label = formatLocale.format(`${separator}.1f`)(parsedRawValue) + '%';
            break;
        case '0.00%':
            label = formatLocale.format(`${separator}.2f`)(parsedRawValue) + '%';
            break;
        case '0.000%':
            label = formatLocale.format(`${separator}.3f`)(parsedRawValue) + '%';
            break;
        case 'arrow_sign_relative_int':
            if (parsedRawValue > 0) {
                prefix = '➚ +';
            }
            else if (parsedRawValue < 0) {
                prefix = '➘ ';
            }
            else {
                prefix = '➙ ';
            }
            label = `${prefix}${formatLocale.format(`${separator}`)(parsedRawValue)}%`;
            break;
        default:
            label = parsedRawValue.toString();
            break;
    }
    return {
        type: 'numeric',
        value: parsedRawValue,
        label,
        footnote: '',
        classes: ['s-font-note--tabularnums'],
    };
}
function formatCountryFlagDatapoint(rawValue) {
    let label = '';
    if (typeof rawValue === 'string') {
        const valueRetyped = rawValue.toUpperCase();
        if (CountryFlags[valueRetyped]) {
            label = CountryFlags[valueRetyped];
        }
    }
    return {
        type: 'country-flag-emoji',
        value: rawValue || '',
        label: label,
        footnote: '',
        classes: [],
    };
}
function formatTextualData(rawValue) {
    return {
        type: 'text',
        value: rawValue || '',
        label: rawValue || '',
        classes: [],
        footnote: '',
    };
}
function formaticNumericData(rawValue, useGroupingSeparator = false) {
    let label = '';
    let value = 0;
    if (rawValue === '' || rawValue === '-' || rawValue === enDash) {
        label = rawValue;
    }
    else if (rawValue !== null) {
        const parsedValue = parseFloat(rawValue);
        value = parsedValue;
        if (useGroupingSeparator) {
            label = formatWithGroupingSeparator(parsedValue);
        }
        else {
            label = formatNoGroupingSeparator(parsedValue);
        }
    }
    return {
        type: 'numeric',
        value,
        label,
        classes: ['s-font-note--tabularnums'],
        footnote: '',
    };
}
function getNumericColumns(data) {
    const columns = getColumnsType(data);
    const numericColumns = [];
    // data[0].length is undefined when creating a new item.
    if (data[0] !== undefined) {
        const header = data[0];
        for (let columnIndex = 0; columnIndex < header.length; columnIndex++) {
            if (columns[columnIndex] && columns[columnIndex].type === 'numeric') {
                const cell = header[columnIndex] || '';
                numericColumns.push({ title: cell, index: columnIndex });
            }
        }
    }
    return numericColumns;
}
function getCategoricalColumns(data) {
    const categoricalColumns = [];
    // data[0].length is undefined when creating a new item
    if (data[0] !== undefined) {
        const row = data[0];
        for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
            const cell = row[columnIndex]; // TODO: check.
            categoricalColumns.push({ title: cell, index: columnIndex });
        }
    }
    return categoricalColumns;
}
function isNumeric(cell) {
    if (typeof cell !== 'string') {
        return false;
    }
    // If it does not match a number signature abort.
    if (!cell.match(/^[+-]?\d+(\.\d+)?$/))
        return false;
    // Check if it parses should it match a number signature.
    const parsed = parseFloat(cell);
    if (isNaN(parsed)) {
        return false;
    }
    return true;
}
function getColumnsType(dataWithHeader) {
    const columns = [];
    const columnAmount = dataWithHeader[0].length;
    for (let c = 0; c < columnAmount; c++) {
        const column = [];
        // Take all columns in one array.
        // note: start at index 1 to skip header.
        for (let row = 1; row < dataWithHeader.length; row++) {
            column.push(dataWithHeader[row][c]);
        }
        const isNumeric = isColumnNumeric(column);
        if (isNumeric) {
            columns.push({
                type: 'numeric',
                useGroupingSeparatorForNumbers: isColumnFormattingWithNumberSeparator(column),
            });
        }
        else {
            columns.push({
                type: 'text',
                useGroupingSeparatorForNumbers: false,
            });
        }
    }
    return columns;
}
function isColumnNumeric(rawColumnData) {
    for (let i = 0; i < rawColumnData.length; i++) {
        const value = rawColumnData[i];
        if (value === null || value === '-' || value === '') {
            continue;
        }
        // If we detect any non numeric value then this column is not numeric anymore.
        if (!isNumeric(value)) {
            return false;
        }
    }
    return true;
}
function isColumnFormattingWithNumberSeparator(rawColumnData) {
    const numericValuesInColumn = [];
    for (let i = 0; i < rawColumnData.length; i++) {
        const parsedValue = parseFloat(rawColumnData[i] || '');
        if (!isNaN(parsedValue)) {
            numericValuesInColumn.push(parsedValue);
        }
    }
    return Math.max(...numericValuesInColumn) >= 10000 || Math.min(...numericValuesInColumn) <= -10000;
}
function getNumericalValuesByColumn(data, column) {
    return data.map(row => {
        if (!row[column])
            row[column] = null;
        const val = row[column];
        let return_val = null;
        if (typeof val === 'string' && val.match(/^[+-]?\d+(\.\d+)?$/)) {
            return_val = parseFloat(val);
        }
        return return_val;
    });
}
function getCategoricalValuesByColumn(data, column) {
    return data.map(row => {
        if (!row[column])
            row[column] = null;
        return row[column];
    });
}
function getNonNullValues(values) {
    return values.filter(value => value !== null);
}
function getMetaData(values, numberValues, maxDigitsAfterComma) {
    return {
        hasNullValues: values.find(value => value === null) !== undefined,
        hasZeroValues: numberValues.find(value => value === 0) !== undefined,
        maxValue: Math.max(...numberValues),
        minValue: Math.min(...numberValues),
        averageValue: getRoundedAverage(numberValues, maxDigitsAfterComma),
        medianValue: getRoundedMedian(numberValues, maxDigitsAfterComma),
    };
}
function getDataWithoutHeaderRow(data) {
    return data.slice(1);
}
function getUniqueCategoriesCount(data, colorColumn) {
    return getUniqueCategoriesObject(data, colorColumn).categories.length;
}
function getUniqueCategoriesObject(data, colorColumnSettings) {
    const { categoricalOptions, selectedColumn } = colorColumnSettings;
    const customCategoriesOrder = categoricalOptions.customCategoriesOrder;
    let hasNullValues = false;
    let values = [];
    if (typeof selectedColumn === 'number') {
        values = data
            .map(row => row[selectedColumn])
            .filter(value => {
            if (value !== null && value !== '') {
                return true;
            }
            hasNullValues = true;
            return false;
        });
    }
    const sortedValuesbyCount = sortValuesByCount(values);
    // If the user has set a custom order, sort the categories accordingly
    if (customCategoriesOrder) {
        sortedValuesbyCount.sort(function (a, b) {
            return customCategoriesOrder.map(c => c.category).indexOf(a) - customCategoriesOrder.map(c => c.category).indexOf(b);
        });
    }
    const categories = Array.from(new Set(sortedValuesbyCount));
    return { hasNullValues, categories };
}
function sortValuesByCount(values) {
    // Count how much each value appears.
    const counter = {};
    for (let i = 0; i < values.length; i++) {
        const key = values[i];
        counter[key] = 1 + counter[key] || 1;
    }
    // Sort counter by amount of appearance.
    const sortedCounter = Object.entries(counter).sort((a, b) => b[1] - a[1]);
    // Return only the values. The amount of appearance is not necessary.
    return sortedCounter.map(x => x[0]);
}
function getMaxDigitsAfterCommaInDataByRow(data, rowIndex) {
    let maxDigitsAfterComma = 0;
    data.forEach(row => {
        const value = row[rowIndex];
        if (typeof value === 'string') {
            const digitsAfterComma = getDigitsAfterComma(value);
            maxDigitsAfterComma = Math.max(maxDigitsAfterComma, digitsAfterComma);
        }
    });
    return maxDigitsAfterComma;
}
function getDigitsAfterComma(value) {
    const digitsAfterComma = value.split('.');
    if (digitsAfterComma.length > 1) {
        return digitsAfterComma[1].length;
    }
    return 0;
}
function getFormattedValue(value, maxDigitsAfterComma) {
    if (value === null) {
        return '';
    }
    let formatSpecifier = ',';
    // if we have float values in data set we extend all float values
    // to max number of positions after comma, e.g. format specifier
    // could be ",.2f" for 2 positions after comma
    if (typeof maxDigitsAfterComma === 'number') {
        formatSpecifier = `,.${maxDigitsAfterComma}f`;
    }
    // if we have number >= 10 000 we add a space after each 3 digits
    if (value >= Math.pow(10, 4)) {
        return formatLocale.format(formatSpecifier)(value);
    }
    else {
        return formatLocaleSmall.format(formatSpecifier)(value);
    }
}
function getFormattedBuckets(formattingOptions, buckets) {
    return buckets.map(bucket => {
        const { from, to, color } = bucket;
        if (formattingOptions.roundingBucketBorders) {
            return {
                from: getFormattedValue(from, formattingOptions.maxDigitsAfterComma),
                to: getFormattedValue(to, formattingOptions.maxDigitsAfterComma),
                color,
            };
        }
        return {
            from: getFormattedValue(from, null),
            to: getFormattedValue(to, null),
            color,
        };
    });
}
function getRoundedValue(value, maxDigitsAfterComma) {
    // Default: round to two digits after comma.
    let roundingFactor = 100;
    // If data contains more precise float numbers we extend
    // each value to max number of digits after comma.
    if (maxDigitsAfterComma !== undefined && maxDigitsAfterComma > 2) {
        roundingFactor = Math.pow(10, maxDigitsAfterComma);
    }
    return Math.round(value * roundingFactor) / roundingFactor;
}
function getCustomBucketBorders(customBuckets) {
    const customBorderStrings = customBuckets.split(',');
    return customBorderStrings.map(value => {
        return parseFloat(value.trim());
    });
}
/**
 * Internal.
 */
function getMedian(values) {
    const middleIndex = Math.floor(values.length / 2);
    const sortedNumbers = [...values].sort((a, b) => a - b);
    if (values.length % 2 !== 0) {
        return sortedNumbers[middleIndex];
    }
    return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
}
function getRoundedMedian(values, maxDigitsAfterComma) {
    const medianValue = getMedian(values);
    return getRoundedValue(medianValue, maxDigitsAfterComma);
}
function getAverage(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}
function getRoundedAverage(values, maxDigitsAfterComma) {
    const averageValue = getAverage(values);
    return getRoundedValue(averageValue, maxDigitsAfterComma);
}

/*
    All colors that are darker than the threshold should be described as white font color.
    We generate a list of the corresponding classes. Further information can be found at:

    https://observablehq.com/d/e40dc4a09badab8a
 */
var colorClassWithLightFontList = [
    's-viz-color-diverging-gender-10-1',
    's-viz-color-diverging-gender-11-1',
    's-viz-color-diverging-gender-12-1',
    's-viz-color-diverging-gender-13-1',
    's-viz-color-diverging-gender-14-1',
    's-viz-color-diverging-gender-7-1',
    's-viz-color-diverging-gender-8-1',
    's-viz-color-diverging-gender-9-1',
    's-viz-color-diverging-three-10-10',
    's-viz-color-diverging-three-11-11',
    's-viz-color-diverging-three-12-11',
    's-viz-color-diverging-three-12-12',
    's-viz-color-diverging-three-13-13',
    's-viz-color-diverging-three-14-13',
    's-viz-color-diverging-three-14-14',
    's-viz-color-diverging-three-2-2',
    's-viz-color-diverging-three-3-3',
    's-viz-color-diverging-three-4-4',
    's-viz-color-diverging-three-5-5',
    's-viz-color-diverging-three-6-6',
    's-viz-color-diverging-three-7-7',
    's-viz-color-diverging-three-8-8',
    's-viz-color-diverging-three-9-9',
    's-viz-color-diverging-two-10-1',
    's-viz-color-diverging-two-11-1',
    's-viz-color-diverging-two-12-1',
    's-viz-color-diverging-two-13-1',
    's-viz-color-diverging-two-14-1',
    's-viz-color-diverging-two-7-1',
    's-viz-color-diverging-two-8-1',
    's-viz-color-diverging-two-9-1',
    's-viz-color-sequential-male-7-1',
    's-viz-color-diverging-gender-10-2',
    's-viz-color-diverging-gender-10-3',
    's-viz-color-diverging-gender-11-2',
    's-viz-color-diverging-gender-11-3',
    's-viz-color-diverging-gender-12-2',
    's-viz-color-diverging-gender-12-3',
    's-viz-color-diverging-gender-13-2',
    's-viz-color-diverging-gender-13-3',
    's-viz-color-diverging-gender-13-4',
    's-viz-color-diverging-gender-14-2',
    's-viz-color-diverging-gender-14-3',
    's-viz-color-diverging-gender-14-4',
    's-viz-color-diverging-gender-7-2',
    's-viz-color-diverging-gender-8-2',
    's-viz-color-diverging-gender-9-2',
    's-viz-color-diverging-gender-9-3',
    's-viz-color-diverging-three-10-9',
    's-viz-color-diverging-three-11-10',
    's-viz-color-diverging-three-13-12',
    's-viz-color-diverging-three-14-12',
    's-viz-color-diverging-three-8-7',
    's-viz-color-diverging-two-10-2',
    's-viz-color-diverging-two-11-2',
    's-viz-color-diverging-two-12-2',
    's-viz-color-diverging-two-13-2',
    's-viz-color-diverging-two-13-3',
    's-viz-color-diverging-two-14-2',
    's-viz-color-diverging-two-14-3',
    's-viz-color-diverging-two-2-1',
    's-viz-color-diverging-two-3-1',
    's-viz-color-diverging-two-4-1',
    's-viz-color-diverging-two-5-1',
    's-viz-color-diverging-two-6-1',
    's-viz-color-diverging-two-7-2',
    's-viz-color-diverging-two-8-2',
    's-viz-color-diverging-two-9-2',
    's-viz-color-sequential-male-5-1',
    's-viz-color-sequential-male-6-1',
    's-viz-color-sequential-male-6-2',
    's-viz-color-sequential-male-7-2',
    's-viz-color-sequential-male-7-3',
    's-viz-color-diverging-three-12-10',
    's-viz-color-diverging-three-13-11',
    's-viz-color-diverging-three-7-6',
    's-viz-color-diverging-three-9-8',
    's-viz-color-diverging-two-11-3',
    's-viz-color-diverging-two-12-3',
    's-viz-color-sequential-two-7-1',
    's-viz-color-diverging-one-10-10',
    's-viz-color-diverging-one-11-11',
    's-viz-color-diverging-one-12-12',
    's-viz-color-diverging-one-13-13',
    's-viz-color-diverging-one-14-14',
    's-viz-color-diverging-one-2-2',
    's-viz-color-diverging-one-3-3',
    's-viz-color-diverging-one-4-4',
    's-viz-color-diverging-one-5-5',
    's-viz-color-diverging-one-6-6',
    's-viz-color-diverging-one-7-7',
    's-viz-color-diverging-one-8-8',
    's-viz-color-diverging-one-9-9',
    's-viz-color-diverging-three-11-9',
    's-viz-color-sequential-female-7-1',
    's-viz-color-sequential-one-2-1',
    's-viz-color-sequential-one-3-1',
    's-viz-color-sequential-one-4-1',
    's-viz-color-sequential-one-5-1',
    's-viz-color-sequential-one-6-1',
    's-viz-color-sequential-one-7-1',
    's-viz-color-sequential-one-7-2',
    's-viz-color-sequential-two-6-1',
    's-viz-color-sequential-two-7-2',
    's-viz-color-diverging-gender-10-10',
    's-viz-color-diverging-gender-11-11',
    's-viz-color-diverging-gender-12-12',
    's-viz-color-diverging-gender-13-13',
    's-viz-color-diverging-gender-14-14',
    's-viz-color-diverging-gender-7-7',
    's-viz-color-diverging-gender-8-8',
    's-viz-color-diverging-gender-9-9',
    's-viz-color-diverging-one-11-10',
    's-viz-color-diverging-one-12-11',
    's-viz-color-diverging-one-13-12',
    's-viz-color-diverging-one-14-13',
    's-viz-color-diverging-three-13-10',
    's-viz-color-diverging-three-9-7',
    's-viz-color-diverging-two-10-10',
    's-viz-color-diverging-two-11-11',
    's-viz-color-diverging-two-12-12',
    's-viz-color-diverging-two-13-4',
    's-viz-color-diverging-two-13-13',
    's-viz-color-diverging-two-14-14',
    's-viz-color-diverging-two-7-7',
    's-viz-color-diverging-two-8-8',
    's-viz-color-diverging-two-9-3',
    's-viz-color-diverging-two-9-9',
    's-viz-color-sequential-one-5-2',
    's-viz-color-sequential-one-6-2',
    's-viz-color-sequential-two-2-1',
    's-viz-color-sequential-two-3-1',
    's-viz-color-sequential-two-4-1',
    's-viz-color-sequential-two-5-1',
    's-viz-color-sequential-two-6-2',
    's-viz-color-sequential-two-7-3',
    's-viz-color-diverging-gender-11-10',
    's-viz-color-diverging-gender-12-11',
    's-viz-color-diverging-gender-13-12',
    's-viz-color-diverging-gender-14-13',
    's-viz-color-diverging-one-10-9',
    's-viz-color-diverging-one-14-12',
    's-viz-color-diverging-one-8-7',
    's-viz-color-diverging-one-9-8',
    's-viz-color-diverging-three-5-4',
    's-viz-color-sequential-female-6-1',
    's-viz-color-sequential-female-7-2',
    's-viz-color-sequential-one-4-2',
    's-viz-color-sequential-one-6-3',
    's-viz-color-sequential-one-7-3',
    's-viz-color-diverging-gender-10-9',
    's-viz-color-diverging-gender-2-2',
    's-viz-color-diverging-gender-3-3',
    's-viz-color-diverging-gender-4-4',
    's-viz-color-diverging-gender-5-5',
    's-viz-color-diverging-gender-6-6',
    's-viz-color-diverging-gender-9-8',
    's-viz-color-diverging-one-11-9',
    's-viz-color-diverging-one-12-10',
    's-viz-color-diverging-one-13-11',
    's-viz-color-diverging-one-7-6',
    's-viz-color-diverging-two-10-9',
    's-viz-color-diverging-two-11-10',
    's-viz-color-diverging-two-12-11',
    's-viz-color-diverging-two-13-12',
    's-viz-color-diverging-two-14-13',
    's-viz-color-diverging-two-9-8',
    's-viz-color-sequential-female-2-1',
    's-viz-color-sequential-female-3-1',
    's-viz-color-sequential-female-4-1',
    's-viz-color-sequential-female-5-1',
    's-viz-color-sequential-one-7-4',
    's-viz-color-diverging-gender-11-9',
    's-viz-color-diverging-gender-12-10',
    's-viz-color-diverging-gender-13-11',
    's-viz-color-diverging-gender-14-12',
    's-viz-color-diverging-gender-7-6',
    's-viz-color-diverging-gender-8-7',
    's-viz-color-diverging-one-13-10',
    's-viz-color-diverging-one-5-4',
    's-viz-color-diverging-one-9-7',
    's-viz-color-diverging-three-10-1',
    's-viz-color-diverging-three-11-1',
    's-viz-color-diverging-three-12-1',
    's-viz-color-diverging-three-13-1',
    's-viz-color-diverging-three-14-1',
    's-viz-color-diverging-three-7-1',
    's-viz-color-diverging-three-8-1',
    's-viz-color-diverging-three-9-1',
    's-viz-color-diverging-two-11-9',
    's-viz-color-diverging-two-12-10',
    's-viz-color-diverging-two-13-11',
    's-viz-color-diverging-two-14-12',
    's-viz-color-diverging-two-7-6',
    's-viz-color-diverging-two-8-7',
    's-viz-color-sequential-female-6-2',
    's-viz-color-sequential-female-7-3',
    's-viz-color-diverging-gender-10-8',
    's-viz-color-diverging-gender-13-10',
    's-viz-color-diverging-gender-14-11',
    's-viz-color-diverging-gender-9-7',
    's-viz-color-diverging-one-10-1',
    's-viz-color-diverging-one-11-1',
    's-viz-color-diverging-one-12-1',
    's-viz-color-diverging-one-13-1',
    's-viz-color-diverging-one-14-1',
    's-viz-color-diverging-one-7-1',
    's-viz-color-diverging-one-8-1',
    's-viz-color-diverging-one-9-1',
    's-viz-color-diverging-two-10-8',
    's-viz-color-diverging-two-13-10',
    's-viz-color-diverging-two-14-11',
    's-viz-color-diverging-two-9-7',
    's-viz-color-diverging-gender-11-8',
    's-viz-color-diverging-three-11-2',
    's-viz-color-diverging-three-12-2',
    's-viz-color-diverging-three-13-2',
    's-viz-color-diverging-three-14-2',
    's-viz-color-sequential-female-4-2',
    's-viz-color-sequential-female-5-2',
    's-viz-color-sequential-female-6-3',
    's-viz-color-sequential-female-7-4',
    's-viz-color-sequential-three-7-1',
    's-viz-color-diverging-one-13-2',
    's-viz-color-diverging-one-14-2',
    's-viz-color-diverging-three-10-2',
    's-viz-color-diverging-three-13-3',
    's-viz-color-diverging-three-2-1',
    's-viz-color-diverging-three-3-1',
    's-viz-color-diverging-three-4-1',
    's-viz-color-diverging-three-5-1',
    's-viz-color-diverging-three-6-1',
    's-viz-color-diverging-three-7-2',
    's-viz-color-diverging-three-9-2',
    's-viz-color-diverging-one-10-2',
    's-viz-color-diverging-one-11-2',
    's-viz-color-diverging-one-12-2',
    's-viz-color-diverging-one-9-2',
    's-viz-color-diverging-three-11-3',
    's-viz-color-diverging-three-12-3',
    's-viz-color-diverging-three-13-4',
    's-viz-color-diverging-three-14-3',
    's-viz-color-diverging-three-8-2',
    's-viz-color-diverging-three-9-3',
    's-viz-color-sequential-three-6-1',
    's-viz-color-sequential-three-7-2',
    's-viz-color-diverging-one-13-3',
    's-viz-color-diverging-one-14-3',
    's-viz-color-diverging-one-2-1',
    's-viz-color-diverging-one-3-1',
    's-viz-color-diverging-one-4-1',
    's-viz-color-diverging-one-5-1',
    's-viz-color-diverging-one-6-1',
    's-viz-color-diverging-one-7-2',
    's-viz-color-diverging-one-8-2',
    's-viz-color-sequential-three-2-1',
    's-viz-color-sequential-three-3-1',
    's-viz-color-sequential-three-4-1',
    's-viz-color-sequential-three-5-1',
    's-viz-color-sequential-three-6-2',
    's-viz-color-sequential-three-7-3',
    's-viz-color-diverging-one-11-3',
    's-viz-color-diverging-one-12-3',
    's-viz-color-diverging-one-13-4',
    's-viz-color-diverging-one-9-3',
    's-viz-color-diverging-one-10-3',
    's-viz-color-diverging-one-14-4',
    's-viz-color-female',
    's-viz-color-one-5',
    's-viz-color-one-7',
    's-viz-color-four-5',
    's-viz-color-four-7',
    's-viz-color-five-5',
    's-viz-color-five-7',
    's-viz-color-seven-5',
    's-viz-color-seven-7',
    's-viz-color-eight-5',
    's-viz-color-eight-7',
    's-viz-color-nine-5',
    's-viz-color-nine-7',
    's-viz-color-eleven-5',
    's-viz-color-eleven-7',
    's-viz-color-darkblue',
    's-viz-color-teal',
    's-viz-color-darkgreen',
    's-viz-color-green',
    's-viz-color-orangered',
    's-viz-color-red',
    's-viz-color-purple',
    's-viz-color-brown',
    's-viz-color-beige',
    's-viz-color-black',
    's-viz-color-grey',
    's-viz-color-nacht',
    's-viz-color-lagune',
    's-viz-color-moos',
    's-viz-color-pesto',
    's-viz-color-sugo',
    's-viz-color-chianti',
    's-viz-color-amethyst',
    's-viz-color-schokolade',
    's-viz-color-sand',
    's-viz-color-aubergine',
    's-viz-color-regen',
    's-viz-color-gray-warm-1',
    's-viz-color-gray-warm-2',
    's-viz-color-gray-warm-3',
    's-viz-color-gray-cool-1',
    's-viz-color-gray-cool-2',
    's-viz-color-gray-cool-3',
    's-viz-color-party-svp-base',
    's-viz-color-party-svp-4',
    's-viz-color-party-svp-5',
    's-viz-color-party-svp-7',
    's-viz-color-party-sp-base',
    's-viz-color-party-sp-4',
    's-viz-color-party-sp-5',
    's-viz-color-party-sp-7',
    's-viz-color-party-fdp-base',
    's-viz-color-party-fdp-5',
    's-viz-color-party-fdp-7',
    's-viz-color-party-cvp-7',
    's-viz-color-party-gps-7',
    's-viz-color-party-glp-7',
    's-viz-color-party-bdp-7',
    's-viz-color-party-evp-7',
    's-viz-color-party-lega-7',
    's-viz-color-party-mcr-base',
    's-viz-color-party-mcr-4',
    's-viz-color-party-mcr-5',
    's-viz-color-party-mcr-7',
    's-viz-color-party-edu-4',
    's-viz-color-party-edu-5',
    's-viz-color-party-edu-7',
    's-viz-color-party-al-5',
    's-viz-color-party-al-7',
    's-viz-color-party-sd-4',
    's-viz-color-party-sd-5',
    's-viz-color-party-sd-7',
    's-viz-color-party-liberale-4',
    's-viz-color-party-liberale-5',
    's-viz-color-party-liberale-7',
    's-viz-color-party-pda-4',
    's-viz-color-party-pda-5',
    's-viz-color-party-pda-7',
    's-viz-color-party-csp-7',
    's-viz-color-party-default-base',
    's-viz-color-party-default-4',
    's-viz-color-party-default-5',
    's-viz-color-party-default-7',
    's-color-gray-7',
    's-color-gray-8',
    's-color-gray-9',
    's-color-primary-4',
    's-color-primary-5',
    's-color-primary-6',
    's-color-primary-7',
    's-color-primary-8',
    's-color-primary-9',
    's-color-secondary-8',
    's-color-secondary-9',
    's-color-negative',
];

const digitWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const gray1 = 's-color-gray-1';
// const gray4 = 's-color-gray-4';
// const gray6 = 's-color-gray-6';
// const gray7 = 's-color-gray-7';
// const gray8 = 's-color-gray-8';
const gray9 = 's-color-gray-9';
function getTextColor(customColor, colorClass) {
    if ((customColor === null || customColor === void 0 ? void 0 : customColor.textColor) !== undefined) {
        return customColor.textColor === 'light' ? gray1 : gray9;
    }
    if (colorClassWithLightFontList.indexOf(colorClass) > -1) {
        return gray1;
    }
    return gray9;
}
function getCustomColorMap(colorOverwrites) {
    return new Map(colorOverwrites.map(({ color, position, textColor }) => [position, { color, textColor }]));
}

var LABEL_LEGEND_ID;
(function (LABEL_LEGEND_ID) {
    LABEL_LEGEND_ID["SMALL"] = "small";
    LABEL_LEGEND_ID["MEDIAN"] = "median";
    LABEL_LEGEND_ID["LARGE"] = "large";
    LABEL_LEGEND_ID["AVERAGE"] = "average";
    LABEL_LEGEND_ID["NO_LABEL"] = "noLabel";
})(LABEL_LEGEND_ID || (LABEL_LEGEND_ID = {}));

const methodBoxTextConfig = {
    ckmeans: 'Die unterschiedlich grossen Gruppen kommen durch ein statistisches Verfahren zustande, welches die Werte so in Gruppen einteilt, dass die Unterschiede möglichst gut sichtbar werden (Jenks Natural Breaks).',
    quantile: 'Die Gruppen wurden so gewählt, dass in jeder Gruppe möglichst gleich viele Werte vorhanden sind.',
    equal: 'Die Gruppen wurden so gewählt, dass sie jeweils einen gleich grossen Bereich auf der Skala abdecken.',
    custom: 'Die Gruppen wurden manuell definiert.',
};
function getMethodBoxInfo(bucketType) {
    const methodBoxText = methodBoxTextConfig[bucketType];
    return {
        text: methodBoxText || '',
        article: {
            title: 'Mehr zur Datenberechnung der NZZ',
            url: 'https://www.nzz.ch/ld.1580452',
        },
    };
}

const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;
const widthConfig = {
    [LABEL_LEGEND_ID.SMALL]: 640,
    [LABEL_LEGEND_ID.LARGE]: 100,
    [LABEL_LEGEND_ID.AVERAGE]: 100,
    [LABEL_LEGEND_ID.MEDIAN]: 60,
    [LABEL_LEGEND_ID.NO_LABEL]: 0, // Here to avoid TS linting errors.
};
function getNumericalLegend(selectedColumn, data, colorColumnSettings, formattingOptions, width) {
    const { numericalOptions } = colorColumnSettings;
    const maxDigitsAfterComma = formattingOptions.maxDigitsAfterComma;
    const customColorMap = getCustomColorMap(numericalOptions.colorOverwrites);
    const values = getNumericalValuesByColumn(data, selectedColumn);
    const nonNullValues = getNonNullValues(values);
    const metaData = getMetaData(values, nonNullValues, maxDigitsAfterComma);
    const buckets = getBucketsForLegend(nonNullValues, colorColumnSettings, metaData.minValue, metaData.maxValue, customColorMap, maxDigitsAfterComma);
    const labelLegend = getLabelLegend(numericalOptions.labelLegend, metaData, width, maxDigitsAfterComma);
    const methodBox = getMethodBoxInfo(numericalOptions.bucketType);
    methodBox.formattedBuckets = getFormattedBuckets(formattingOptions, buckets);
    const legend = Object.assign({ buckets, hasSingleValueBucket: hasSingleValueBucket(buckets), type: 'numerical', labelLegend,
        methodBox }, metaData);
    // For all bucket types we calculate the resulting buckets out of a given dataset,
    // custom bucketing need a special handling of min/max values because the first and the last
    // custom bucket value could be lower/higher than min/max.
    if (numericalOptions.bucketType === 'custom') {
        // If first custom bucket value is less than min value in given data set
        // we set min value of legend to starting value of custom buckets.
        const minBucketValue = legend.buckets[0].from;
        if (legend.minValue > minBucketValue) {
            legend.minValue = minBucketValue;
        }
        // iI last custom bucket value is higher that max value in given data set
        // we set max value of legend to last custom bucket value.
        const maxBucketValue = legend.buckets[legend.buckets.length - 1].to;
        if (legend.maxValue < maxBucketValue) {
            legend.maxValue = maxBucketValue;
        }
    }
    return legend;
}
function getCategoricalLegend(data, colorColumnSettings) {
    const { categoricalOptions } = colorColumnSettings;
    const type = 'categorical';
    const customColorMap = getCustomColorMap(categoricalOptions.colorOverwrites);
    const categoryObject = getUniqueCategoriesObject(data, colorColumnSettings);
    const hasNullValues = categoryObject.hasNullValues;
    const categories = [];
    categoryObject.categories.forEach((label, index) => {
        categories.push({
            label,
            color: getCategoryColor(index, customColorMap),
        });
    });
    return {
        hasNullValues,
        type,
        categories,
    };
}
/**
 * Internal.
 */
function getCategoryColor(index, customColorMap) {
    const colorScheme = digitWords[index];
    let colorClass = '';
    // The map starts at index 1 so we have to offset the index by 1.
    const customColor = customColorMap.get(index + 1);
    if (colorScheme) {
        colorClass = `s-viz-color-${colorScheme}-5`;
    }
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined ? customColor.color : '',
        textColor: getTextColor(customColor, colorClass),
    };
}
function getLabelLegend(labelType, metaData, width, maxDigitsAfterComma) {
    if (labelType === LABEL_LEGEND_ID.NO_LABEL)
        return null;
    const { averageValue, minValue, maxValue, medianValue } = metaData;
    const range = maxValue - minValue;
    let position;
    let id;
    let value;
    let descriptionAlignment;
    let label;
    switch (labelType) {
        case LABEL_LEGEND_ID.MEDIAN:
            id = LABEL_LEGEND_ID.MEDIAN;
            position = ((medianValue - minValue) * 100) / range;
            value = getRoundedValue(medianValue, maxDigitsAfterComma);
            descriptionAlignment = getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma);
            label = 'Median';
            break;
        default:
            id = LABEL_LEGEND_ID.AVERAGE;
            position = ((averageValue - minValue) * 100) / range;
            value = averageValue;
            descriptionAlignment = getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma);
            label = 'Durchschnitt';
    }
    return {
        id,
        label,
        value,
        position,
        descriptionAlignment,
    };
}
function hasSingleValueBucket(buckets) {
    const firstBucket = buckets[0];
    return firstBucket.from === firstBucket.to;
}
function getBucketsForLegend(filteredValues, colorColumn, minValue, maxValue, customColorMap, maxDigitsAfterComma) {
    const bucketType = colorColumn.numericalOptions.bucketType;
    const numberBuckets = colorColumn.numericalOptions.numberBuckets;
    const scale = colorColumn.numericalOptions.scale;
    const colorOptions = {
        colorScheme: colorColumn.numericalOptions.colorScheme,
        colorOverwrites: customColorMap,
    };
    if (bucketType === 'ckmeans') {
        return getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions);
    }
    else if (bucketType === 'quantile') {
        return getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions);
    }
    else if (bucketType === 'equal') {
        return getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma);
    }
    else if (bucketType === 'custom') {
        return getCustomBuckets(colorColumn, scale, colorOptions);
    }
    return [];
}
function getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions) {
    const ckmeansBuckets = ckmeans(filteredValues, numberBuckets);
    return ckmeansBuckets.map((bucket, index) => {
        const from = index === 0 ? Math.min(...bucket) : Math.max(...ckmeansBuckets[index - 1]);
        const to = Math.max(...bucket);
        return {
            from,
            to,
            color: getBucketColor(numberBuckets, index, scale, colorOptions),
        };
    });
}
function getQuantileBuckets(filteredValues, numberBuckets, minValue, scale, colorOptions) {
    const quantilePortion = 1 / numberBuckets;
    const quantiles = [];
    for (let i = 1; i <= numberBuckets; i++) {
        quantiles.push(i * quantilePortion);
    }
    const quantileUpperBorders = quantile(filteredValues, quantiles);
    return quantileUpperBorders.map((quantileBorder, index) => {
        const from = index === 0 ? minValue : quantileUpperBorders[index - 1];
        return {
            from,
            to: quantileBorder,
            color: getBucketColor(numberBuckets, index, scale, colorOptions),
        };
    });
}
function getEqualBuckets(numberBuckets, minValue, maxValue, scale, colorOptions, maxDigitsAfterComma) {
    const portion = 1 / numberBuckets;
    const range = maxValue - minValue;
    const equalBuckets = [];
    for (let i = 0; i < numberBuckets; i++) {
        let from = i === 0 ? minValue : minValue + range * portion * i;
        let to = minValue + range * portion * (i + 1);
        // round numbers
        const roundingFactor = Math.pow(10, maxDigitsAfterComma);
        from = Math.round(from * roundingFactor) / roundingFactor;
        to = Math.round(to * roundingFactor) / roundingFactor;
        equalBuckets.push({
            from,
            to,
            color: getBucketColor(numberBuckets, i, scale, colorOptions),
        });
    }
    return equalBuckets;
}
function getCustomBuckets(colorColumnSettings, scale, colorOptions) {
    const { numericalOptions } = colorColumnSettings;
    if (numericalOptions.customBuckets !== undefined) {
        const customBorderValues = getCustomBucketBorders(numericalOptions.customBuckets);
        const numberBuckets = customBorderValues.length - 1;
        const minBorder = customBorderValues.shift() || 0;
        const customBuckets = [];
        customBorderValues.forEach((borderValue, index) => {
            customBuckets.push({
                from: index === 0 ? minBorder : customBorderValues[index - 1],
                to: borderValue,
                color: getBucketColor(numberBuckets, index, scale, colorOptions),
            });
        });
        return customBuckets;
    }
    return [];
}
function getDescriptionAlignment(id, value, position, width, maxDigitsAfterComma) {
    const availableSpaceForLabel = getAvailableSpaceForLabel(position, width);
    const valueLength = getValueLength(value, maxDigitsAfterComma);
    const approxLabelWidth = widthConfig[id] + valueLength * 8;
    if (availableSpaceForLabel < approxLabelWidth) {
        return 'text-align: right;';
    }
    return `margin-left: ${position}%`;
}
function getAvailableSpaceForLabel(position, width) {
    let legendPixelWidth;
    if (width > 640) {
        legendPixelWidth = widthConfig[LABEL_LEGEND_ID.SMALL];
    }
    else {
        legendPixelWidth = (width * widthConfig[LABEL_LEGEND_ID.LARGE]) / 100;
    }
    return (legendPixelWidth * (100 - position)) / 100;
}
function getValueLength(value, maxDigitsAfterComma) {
    return value.toFixed(0).length + maxDigitsAfterComma;
}
function getBucketColor(numberBuckets, index, scale, colorOptions) {
    const colorScheme = colorOptions.colorScheme;
    const customColor = colorOptions.colorOverwrites.get(index);
    let colorClass = '';
    let textColor = '';
    if (scale === 'sequential') {
        colorClass = `s-viz-color-sequential-${colorScheme}-${numberBuckets}-${numberBuckets - index}`;
        textColor = getTextColor(customColor, colorClass);
    }
    else {
        // if we have a diverging scale we deal with two cases:
        // a) diverging value = one of bucket border values,
        //    i.e. we do not have a bucket with a neutral color value
        // b) diverging value = one of the buckets,
        //    i.e. this bucket has a neutral color value
        // scale values could be e.g. border-1, border-2 or bucket-1, bucket-2
        const divergingSpecification = scale.split('-');
        const divergingIndex = parseInt(divergingSpecification[1]);
        // in order to know which diverging scale size we have to use,
        // we have to check which side is bigger first and then calculate
        // the size depending on the number of buckets of the bigger side
        const numberBucketsLeft = divergingIndex;
        let numberBucketsRight = numberBuckets - divergingIndex;
        if (divergingSpecification[0] === 'bucket') {
            numberBucketsRight -= 1;
        }
        const numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
        let scaleSize = numberBucketsBiggerSide * 2;
        if (divergingSpecification[0] === 'bucket') {
            scaleSize += 1;
        }
        // if the left side is smaller we cannot start with scale position 1
        // instead we have to calculate the position depending on scale size
        // and number of buckets
        let scalePosition;
        if (numberBucketsLeft < numberBucketsRight) {
            scalePosition = scaleSize - numberBuckets + index + 1;
        }
        else {
            scalePosition = index + 1;
        }
        colorClass = `s-viz-color-diverging-${colorScheme}-${scaleSize}-${scalePosition}`;
        textColor = getTextColor(customColor, colorClass);
    }
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined ? customColor.color : '',
        textColor,
    };
}

function hasCustomBuckets(bucketType) {
    return bucketType === 'custom';
}
function getNumberBuckets(colorColumn) {
    try {
        if (colorColumn.numericalOptions.bucketType !== 'custom') {
            return colorColumn.numericalOptions.numberBuckets;
        }
        else {
            const bucketBorderValues = getCustomBucketBorders(colorColumn.numericalOptions.customBuckets);
            return bucketBorderValues.length - 1; // min value is part of border values and has to be excluded here
        }
    }
    catch (_a) {
        return 0;
    }
}
function getColorColumn(colorColumnAvailable, settings, data, width) {
    if (colorColumnAvailable && typeof (settings === null || settings === void 0 ? void 0 : settings.selectedColumn) === 'number') {
        const selectedColumn = settings.selectedColumn;
        if (settings.colorColumnType === 'numerical') {
            return createNumericalColorColumn(selectedColumn, settings, data, width);
        }
        else {
            return createCategoricalColorColumn(selectedColumn, settings, data);
        }
    }
    return null;
}
function createNumericalColorColumn(selectedColumn, settings, data, width) {
    const maxDigitsAfterComma = getMaxDigitsAfterCommaInDataByRow(data, selectedColumn);
    const roundingBucketBorders = settings.numericalOptions.bucketType !== 'custom';
    const formattingOptions = { maxDigitsAfterComma, roundingBucketBorders };
    const legend = getNumericalLegend(selectedColumn, data, settings, formattingOptions, width);
    const colors = [];
    if (typeof settings.selectedColumn == 'number') {
        const valuesByColumn = getNumericalValuesByColumn(data, settings.selectedColumn);
        valuesByColumn.map(value => {
            const color = getColorForNumericalColoredColoumn(value, legend);
            colors.push(color);
        });
    }
    return Object.assign({ legend,
        colors }, settings);
}
function createCategoricalColorColumn(selectedColumn, settings, data) {
    const legend = getCategoricalLegend(data, settings);
    const categoriesByColumn = getCategoricalValuesByColumn(data, selectedColumn);
    const colors = [];
    categoriesByColumn.map(category => {
        const color = getColorForCategoricalColoredColumn(category, legend);
        colors.push(color);
    });
    return Object.assign({ legend,
        colors }, settings);
}
/**
 * Internal.
 */
function getColorForNumericalColoredColoumn(value, legend) {
    if (typeof value !== 'number') {
        return {
            colorClass: '',
            customColor: '#fff',
            textColor: 's-color-gray-6',
        };
    }
    const buckets = legend.buckets;
    const bucket = buckets.find((bucket, index) => {
        if (index === 0) {
            return value <= bucket.to;
        }
        else if (index === buckets.length - 1) {
            return bucket.from < value;
        }
        else {
            return bucket.from < value && value <= bucket.to;
        }
    });
    if (bucket) {
        return {
            colorClass: bucket.color.colorClass,
            customColor: bucket.color.customColor,
            textColor: bucket.color.textColor,
        };
    }
    else {
        return {
            colorClass: 's-color-gray-4',
            customColor: '',
            textColor: 's-color-gray-6',
        };
    }
}
function getColorForCategoricalColoredColumn(value, legend) {
    if (typeof value !== 'string') {
        return {
            colorClass: '',
            customColor: '#fff',
            textColor: 's-color-gray-6',
        };
    }
    const categories = legend.categories;
    const category = categories.find(category => category.label === value);
    if (category) {
        return {
            colorClass: category.color.colorClass,
            customColor: category.color.customColor,
            textColor: category.color.textColor,
        };
    }
    else {
        return {
            colorClass: 's-color-gray-4',
            customColor: '',
            textColor: '',
        };
    }
}

/**
 * Processes the raw footnote metadata into a structured format.
 * We need this format because not only do we mark footnotes with labels
 * in the table, they will also show up in the footer.
 *
 * Filter: It removes all empty footnotes and also removes
 *         header footnotes if the header is disabled.
 *
 * Sort: Afterwards sorts all footnotes first by row then
 *       by column so they are chronological.
 *
 * Foreach: Mapping the raw meta data to a new format.
 *          Also merge duplicate footnotes into one object.
 */
function getFootnotes(metaData, hideTableHeader) {
    const footnotes = [];
    // Map for quick access for dataformatting cells.
    // The key is rowIndex-colindex.
    // Value is the index of the footnote.
    const footnoteCellMap = new Map();
    metaData
        .filter(cell => {
        // Remove empty footnotes.
        if (!cell.data.footnote || cell.data.footnote === '') {
            return false;
        }
        // Remove header footnotes if the header is disabled.
        if (hideTableHeader && cell.rowIndex === 0) {
            return false;
        }
        return true;
    })
        .sort((a, b) => {
        if (a.rowIndex !== b.rowIndex) {
            return a.rowIndex - b.rowIndex;
        }
        return a.colIndex - b.colIndex;
    }).forEach(cellMetaData => {
        const currentFootnoteText = cellMetaData.data.footnote;
        const existingFootnote = footnotes.find(filterFootnote => currentFootnoteText === filterFootnote.value);
        // We move the index down by -1 so the header row has an index of -1;
        // It is because we split the data between the header and the actual data
        // and we want the actual data to start at 0.
        const rowIndex = cellMetaData.rowIndex - 1;
        const colIndex = cellMetaData.colIndex;
        if (existingFootnote) { // Same footnote given. Merge into one entry.
            footnoteCellMap.set(`${rowIndex}-${colIndex}`, `${existingFootnote.index}`);
        }
        else {
            const index = footnotes.length + 1;
            footnotes.push({
                value: currentFootnoteText,
                index,
            });
            footnoteCellMap.set(`${rowIndex}-${colIndex}`, `${index}`);
        }
    });
    return {
        footnotes,
        footnoteCellMap,
    };
}

var MINIBAR_TYPE;
(function (MINIBAR_TYPE) {
    MINIBAR_TYPE["POSITIVE"] = "positive";
    MINIBAR_TYPE["NEGATIVE"] = "negative";
    MINIBAR_TYPE["MIXED"] = "mixed";
    MINIBAR_TYPE["EMPTY"] = "empty";
})(MINIBAR_TYPE || (MINIBAR_TYPE = {}));
function getMinibar(minibarsAvailable, minibarSettings, columns) {
    if (!minibarSettings)
        return null;
    // A minibar with a columnIndex of null will not be shown.
    const minibar = {
        columnIndex: null,
        values: [],
        type: MINIBAR_TYPE.EMPTY,
        barColor: minibarSettings.barColor,
        settings: minibarSettings,
    };
    // If we actually have valid settings for the minibar we will populate
    // Minibar object with correct values.
    if (minibarsAvailable === true && typeof minibarSettings.selectedColumn === 'number') {
        const column = columns[minibarSettings.selectedColumn];
        const valuesAndType = getMinibarValuesAndType(column);
        minibar.columnIndex = minibarSettings.selectedColumn;
        minibar.type = valuesAndType.minibarType;
        minibar.values = valuesAndType.values;
        checkPositiveBarColor(minibar);
        checkNegativeBarColor(minibar);
        if (minibarSettings.invertColors) {
            invertBarColors(minibar);
        }
    }
    return minibar;
}
function getMinibarValuesAndType(column) {
    let minValue = 0;
    let maxValue = 0;
    let minibarType = MINIBAR_TYPE.MIXED;
    column.forEach(cell => {
        const value = cell.value;
        if (minValue === null || value < minValue) {
            minValue = value;
        }
        if (maxValue === null || value > maxValue) {
            maxValue = value;
        }
    });
    if (minValue <= 0 && maxValue <= 0) {
        minibarType = MINIBAR_TYPE.NEGATIVE;
    }
    else if (minValue >= 0 && maxValue >= 0) {
        minibarType = MINIBAR_TYPE.POSITIVE;
    }
    const values = column.map(cell => {
        return getMinibarValue(minibarType, cell.value, minValue, maxValue);
    });
    return {
        values,
        minibarType,
    };
}
function getMinibarValue(type, value, min, max) {
    if (value === null)
        return 0;
    switch (type) {
        case MINIBAR_TYPE.POSITIVE:
            return Math.abs((value * 100) / max);
        case MINIBAR_TYPE.NEGATIVE:
            return Math.abs((value * 100) / min);
        default:
            return Math.abs((value * 100) / Math.max(Math.abs(min), Math.abs(max)));
    }
}
/**
 * Used in option availability.
 */
function getMinibarNumbersWithType(data, selectedColumnIndex) {
    const minibarsWithType = {
        items: [],
        numbers: [],
        type: MINIBAR_TYPE.MIXED,
    };
    // First row is always header so we add a null entry for it.
    minibarsWithType.items.push({
        value: null,
        type: MINIBAR_TYPE.EMPTY,
    });
    // First row is always header so start at 1.
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const cell = row[selectedColumnIndex];
        const value = parseFloat(cell || '');
        if (isNaN(value)) {
            minibarsWithType.items.push({
                value: null,
                type: MINIBAR_TYPE.EMPTY,
            });
        }
        else {
            const type = getTypeOfValue(value);
            minibarsWithType.numbers.push(value);
            minibarsWithType.items.push({
                value,
                type,
            });
        }
    }
    minibarsWithType.type = getMinibarType(minibarsWithType.numbers);
    return minibarsWithType;
}
function checkPositiveBarColor(minibar) {
    const className = minibar.barColor.positive.className;
    const colorCode = minibar.barColor.positive.colorCode;
    if (className === '' && colorCode === '') {
        minibar.barColor.positive.className = getPositiveColor(minibar.type);
    }
    else if (className !== '') {
        minibar.barColor.positive.colorCode = '';
    }
}
function checkNegativeBarColor(minibar) {
    const className = minibar.barColor.negative.className;
    const colorCode = minibar.barColor.negative.colorCode;
    if (className === '' && colorCode === '') {
        minibar.barColor.negative.className = getNegativeColor(minibar.type);
    }
    else if (className !== '') {
        minibar.barColor.negative.colorCode = '';
    }
}
function invertBarColors(minibar) {
    const temp = minibar.barColor.negative;
    minibar.barColor.negative = minibar.barColor.positive;
    minibar.barColor.positive = temp;
}
function getTypeOfValue(value) {
    if (value < 0) {
        return MINIBAR_TYPE.NEGATIVE;
    }
    if (value > 0) {
        return MINIBAR_TYPE.POSITIVE;
    }
    return MINIBAR_TYPE.EMPTY;
}
function getMinibarType(numbers) {
    const allPositive = numbers.every(number => number >= 0);
    const allNegative = numbers.every(number => number <= 0);
    if (allPositive) {
        return MINIBAR_TYPE.POSITIVE;
    }
    else if (allNegative) {
        return MINIBAR_TYPE.NEGATIVE;
    }
    return MINIBAR_TYPE.MIXED;
}
function getPositiveColor(type) {
    if (type === 'mixed') {
        return 's-viz-color-diverging-2-2';
    }
    return 's-viz-color-one-5';
}
function getNegativeColor(type) {
    if (type === 'mixed') {
        return 's-viz-color-diverging-2-1';
    }
    return 's-viz-color-one-5';
}

var $schema = "http://json-schema.org/draft-07/schema#";
var type = "object";
var title$g = "Quiz";
var properties = {
	title: {
		title: "Titel",
		type: "string"
	},
	elements: {
		title: "Quiz-Elemente",
		type: "array",
		"Q:options": {
			expandable: {
				itemLabelProperty: [
					"title",
					"question"
				]
			},
			availabilityChecks: [
				{
					type: "ItemHasId",
					config: {
						unavailableMessage: "Bitte speichere deinen Titel um fortzufahren."
					}
				}
			]
		},
		items: {
			oneOf: [
				{
					$ref: "#/definitions/cover"
				},
				{
					$ref: "#/definitions/multipleChoice"
				},
				{
					$ref: "#/definitions/numberGuess"
				},
				{
					$ref: "#/definitions/numberPoll"
				},
				{
					$ref: "#/definitions/mapPointGuess"
				},
				{
					$ref: "#/definitions/lastCard"
				}
			]
		}
	}
};
var required = [
	"title"
];
var definitions = {
	cover: {
		type: "object",
		title: "Cover",
		properties: {
			id: {
				$ref: "#/definitions/elementId"
			},
			type: {
				type: "string",
				"default": "cover",
				"enum": [
					"cover"
				],
				"Q:options": {
					enum_titles: [
						"Cover"
					],
					hideInEditor: true
				}
			},
			title: {
				type: "string",
				title: "Titel des Quiz"
			}
		}
	},
	multipleChoice: {
		type: "object",
		title: "Multiple Choice",
		properties: {
			id: {
				$ref: "#/definitions/elementId"
			},
			type: {
				type: "string",
				"default": "multipleChoice",
				"enum": [
					"multipleChoice"
				],
				"Q:options": {
					hideInEditor: true
				}
			},
			introduction: {
				$ref: "#/definitions/introduction"
			},
			image: {
				$ref: "#/definitions/image"
			},
			question: {
				type: "string",
				title: "Frage"
			},
			answer: {
				type: "string",
				title: "Korrekte Antwort"
			},
			choices: {
				type: "array",
				title: "Falsche Antworten",
				"Q:options": {
					compact: true
				},
				items: {
					type: "string",
					"default": "",
					title: "Falsche Antwort"
				}
			},
			answerText: {
				type: "string",
				title: "Ausformulierte Antwort",
				"Q:options": {
					placeholder: "Sagt dem Nutzer in Prosa, welche Antwort richtig ist und liefert idealerweise noch etwas Erklärung dazu."
				}
			},
			notes: {
				type: "string",
				title: "Anmerkungen"
			},
			articleRecommendations: {
				$ref: "#/definitions/articleRecommendations"
			}
		},
		required: [
			"question",
			"answer"
		]
	},
	numberGuess: {
		type: "object",
		title: "Zahl schätzen",
		properties: {
			id: {
				$ref: "#/definitions/elementId"
			},
			type: {
				type: "string",
				"default": "numberGuess",
				"enum": [
					"numberGuess"
				],
				"Q:options": {
					hideInEditor: true
				}
			},
			introduction: {
				$ref: "#/definitions/introduction"
			},
			image: {
				$ref: "#/definitions/image"
			},
			question: {
				type: "string",
				title: "Frage"
			},
			answer: {
				type: "number",
				title: "Korrekte Antwort"
			},
			unit: {
				type: "string",
				title: "Einheit Plural",
				"Q:options": {
					placeholder: "Was für eine Zahl ist zu schätzen? Meter? Personen? Franken? etc."
				}
			},
			unit_singular: {
				type: "string",
				title: "Einheit Singular",
				"Q:options": {
					placeholder: "Nur nötig, falls abweichend von Einheit Plural."
				}
			},
			min: {
				type: "number",
				title: "Minimalwert auf der Schätzskala"
			},
			max: {
				type: "number",
				title: "Maximalwert auf der Schätzskala"
			},
			step: {
				type: "number",
				minimum: 0,
				title: "Grösse der Zwischenschritte beim Verschieben des Sliders",
				"Q:options": {
					placeholder: "Sollte so gewählt sein, dass sich zwischen Minimal- und Maximalwert etwa 100-500 Zwischenschritte ergeben."
				}
			},
			answerText: {
				type: "string",
				title: "Ausformulierte Antwort",
				"Q:options": {
					placeholder: "Sagt dem Nutzer in Prosa, welche Antwort richtig ist und liefert idealerweise noch etwas Erklärung dazu."
				}
			},
			notes: {
				type: "string",
				title: "Anmerkungen"
			},
			articleRecommendations: {
				$ref: "#/definitions/articleRecommendations"
			}
		},
		required: [
			"question",
			"answer",
			"min",
			"max",
			"step"
		]
	},
	numberPoll: {
		type: "object",
		title: "Zahl Umfrage",
		properties: {
			id: {
				$ref: "#/definitions/elementId"
			},
			type: {
				type: "string",
				"default": "numberPoll",
				"enum": [
					"numberPoll"
				],
				"Q:options": {
					hideInEditor: true
				}
			},
			introduction: {
				$ref: "#/definitions/introduction"
			},
			image: {
				$ref: "#/definitions/image"
			},
			question: {
				type: "string",
				title: "Frage"
			},
			questionSubTitle: {
				type: "string",
				title: "Frage Untertitel"
			},
			unit: {
				type: "string",
				title: "Einheit Plural",
				"Q:options": {
					placeholder: "Was für eine Zahl? Meter? Personen? Franken? etc."
				}
			},
			unit_singular: {
				type: "string",
				title: "Einheit Singular",
				"Q:options": {
					placeholder: "Nur nötig, falls abweichend von Einheit Plural."
				}
			},
			min: {
				type: "number",
				title: "Minimalwert auf der Skala"
			},
			max: {
				type: "number",
				title: "Maximalwert auf der Skala"
			},
			step: {
				type: "number",
				minimum: 0,
				title: "Grösse der Zwischenschritte beim Verschieben des Sliders",
				"Q:options": {
					placeholder: "Sollte so gewählt sein, dass sich zwischen Minimal- und Maximalwert etwa 100-500 Zwischenschritte ergeben."
				}
			},
			notes: {
				type: "string",
				title: "Anmerkungen"
			},
			articleRecommendations: {
				$ref: "#/definitions/articleRecommendations"
			}
		},
		required: [
			"question",
			"min",
			"max",
			"step"
		]
	},
	mapPointGuess: {
		type: "object",
		title: "Ort schätzen",
		properties: {
			id: {
				$ref: "#/definitions/elementId"
			},
			type: {
				type: "string",
				"default": "mapPointGuess",
				"enum": [
					"mapPointGuess"
				],
				"Q:options": {
					hideInEditor: true
				}
			},
			introduction: {
				$ref: "#/definitions/introduction"
			},
			image: {
				$ref: "#/definitions/image"
			},
			question: {
				type: "string",
				title: "Frage"
			},
			answer: {
				$ref: "#/definitions/geojson-point"
			},
			answerText: {
				type: "string",
				title: "Ausformulierte Antwort"
			},
			notes: {
				type: "string",
				title: "Anmerkungen"
			},
			articleRecommendations: {
				$ref: "#/definitions/articleRecommendations"
			}
		},
		required: [
			"question"
		]
	},
	lastCard: {
		type: "object",
		title: "Letzte Seite",
		properties: {
			id: {
				$ref: "#/definitions/elementId"
			},
			type: {
				type: "string",
				"default": "lastCard",
				"enum": [
					"lastCard"
				],
				"Q:options": {
					enum_titles: [
						"letzte Seite"
					],
					hideInEditor: true
				}
			},
			title: {
				type: "string",
				title: "Titel",
				"default": "Geschafft. Danke fürs Mitspielen.",
				"Q:options": {
					hideInEditor: true
				}
			},
			isFinalScoreShown: {
				type: "boolean",
				title: "Auswertung anzeigen",
				"default": true
			},
			text: {
				type: "string",
				title: "Abmoderation"
			},
			articleRecommendations: {
				$ref: "#/definitions/articleRecommendations"
			},
			quizLink: {
				type: "string",
				title: "Link zu Anschlussquiz",
				"Q:options": {
					placeholder: "https&#58;//www&#46;nzz&#46;ch/&#46;&#46;&#46; (am besten ein thematisch ähnliches Quiz, das ein ähnliches Zielpublikum ansprechen dürfte)"
				}
			},
			quizTitle: {
				type: "string",
				title: "Titel Anschlussquiz"
			}
		}
	},
	elementId: {
		type: "string",
		title: "ID",
		"Q:default": "generatedId",
		"Q:options": {
			hideInEditor: true
		}
	},
	articleRecommendations: {
		type: "array",
		title: "Artikelempfehlungen",
		"Q:options": {
			compact: true
		},
		items: {
			type: "object",
			title: "Artikelempfehlung",
			properties: {
				text: {
					type: "string",
					title: "Anmoderation"
				},
				articleId: {
					type: "string",
					title: "Artikel ID",
					"Q:options": {
						placeholder: "ld.123456"
					}
				}
			}
		}
	},
	introduction: {
		type: "string",
		title: "Einleitung"
	},
	image: {
		type: "object",
		"Q:type": "files",
		"Q:options": {
			maxFiles: 1,
			acceptedFiles: "image/*",
			fileProperties: {
				url: "url",
				key: "key",
				size: "size",
				width: "width",
				height: "height",
				type: "type"
			}
		}
	},
	"geojson-point": {
		type: "object",
		title: "Punkt",
		"Q:type": "geojsonPoint",
		"Q:options": {
			bbox: "manual"
		},
		required: [
			"type"
		],
		properties: {
			type: {
				type: "string",
				"default": "Feature",
				"enum": [
					"Feature"
				]
			},
			geometry: {
				type: "object",
				properties: {
					type: {
						type: "string",
						"default": "Point",
						"enum": [
							"Point"
						]
					},
					coordinates: {
						oneOf: [
							{
								$ref: "#/definitions/position"
							},
							{
								type: "null"
							}
						]
					}
				}
			},
			bbox: {
				oneOf: [
					{
						$ref: "#/definitions/bbox"
					},
					{
						type: "null"
					}
				]
			},
			properties: {
				type: "object",
				properties: {
					pointLabel: {
						type: "string",
						title: "Beschriftung Punkt bei der Auflösung"
					}
				}
			}
		}
	},
	position: {
		description: "A single position",
		type: "array",
		minItems: 2,
		items: [
			{
				type: "number"
			},
			{
				type: "number"
			}
		],
		additionalItems: false
	},
	bbox: {
		description: "A bounding box",
		type: "array",
		minItems: 4,
		items: [
			{
				type: "number"
			},
			{
				type: "number"
			},
			{
				type: "number"
			},
			{
				type: "number"
			}
		],
		additionalItems: false
	}
};
var schema$1 = {
	$schema: $schema,
	type: type,
	title: title$g,
	properties: properties,
	required: required,
	definitions: definitions
};

const ajv = new Ajv({
    strict: false,
});
const validate = ajv.compile(schema$1);
const route$k = {
    method: 'POST',
    path: '/rendering-info/web',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: payload => {
                const payloadTyped = payload;
                const item = payloadTyped.item;
                const toolRuntimeConfig = payloadTyped.toolRuntimeConfig;
                if (typeof payloadTyped !== 'object' || typeof item !== 'object' || typeof toolRuntimeConfig !== 'object') {
                    throw Boom.badRequest('The given payload for this route is not correct.');
                }
                if (validate(item)) {
                    return new Promise(resolve => {
                        resolve(item);
                    });
                }
                else {
                    throw Boom.badRequest(JSON.stringify(validate.errors));
                }
            },
        },
    },
    handler: function (request) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = createId(request);
            let qtableCompiledScript = '';
            let styleHashMap = null;
            try {
                qtableCompiledScript = readFileSync('dist/Q-Table.js', {
                    encoding: 'utf-8',
                });
            }
            catch (e) {
                console.log('Failed reading compiled Q-Table code - ', e);
            }
            try {
                const rawString = readFileSync('dist/styles/hashMap.json', {
                    encoding: 'utf-8',
                });
                styleHashMap = JSON.parse(rawString);
            }
            catch (e) {
                console.log('Failed reading compiled style hashmap - ', e);
            }
            const payload = request.orig.payload;
            // Extract table configurations.
            const config = payload.item;
            const toolRuntimeConfig = payload.toolRuntimeConfig || {};
            const displayOptions = toolRuntimeConfig.displayOptions || {};
            const options = config.options;
            let colorColumn = null;
            const width = getExactPixelWidth(toolRuntimeConfig);
            const dataWithoutHeaderRow = getDataWithoutHeaderRow(config.data.table);
            const dataLength = dataWithoutHeaderRow.length;
            let tableData = {
                rows: [],
                header: [],
                columns: [],
            };
            // Process options.
            const footnoteObj = getFootnotes(config.data.metaData.cells, options.hideTableHeader);
            const initWithCardLayout = getInitWithCardLayoutFlag(width, options);
            const pageSize = calculatePageSize(dataLength, initWithCardLayout, options, toolRuntimeConfig);
            const minibarsAvailable = yield areMinibarsAvailable(request, config);
            const colorColumnAvailable = yield isColorColumnAvailable(request, config);
            // Most important part.
            // Processing raw data into a format we can use in the front-end.
            try {
                tableData = formatTableData(config.data.table, footnoteObj.footnoteCellMap, options);
            }
            catch (e) {
                // TODO Add logging to Kibana
                console.error('Exception during formatting table data - ', e);
            }
            // Need processed in order to setup the minibar.
            const minibar = getMinibar(minibarsAvailable, options.minibar, tableData.columns);
            try {
                colorColumn = getColorColumn(colorColumnAvailable, options.colorColumn, dataWithoutHeaderRow, width || 0);
            }
            catch (e) {
                // TODO Add logging to Kibana.
                console.error('Exception during creating colorColumn - ', e);
            }
            const props = {
                item: config,
                config,
                tableHead: tableData.header,
                rows: tableData.rows,
                minibar,
                footnotes: footnoteObj.footnotes,
                colorColumn,
                numberOfRows: dataLength,
                displayOptions: displayOptions,
                noInteraction: payload.toolRuntimeConfig.noInteraction || false,
                id,
                width,
                initWithCardLayout,
                pageSize,
                hideTableHeader: options.hideTableHeader,
                frozenRowKey: options.frozenRowKey
            };
            const renderingInfo = {
                polyfills: ['Promise'],
                stylesheets: [],
                scripts: [
                    {
                        content: qtableCompiledScript,
                    },
                    {
                        content: `
          (function () {
            var target = document.querySelector('#${id}_container');
            target.innerHTML = "";
            var props = ${JSON.stringify(props)};
            new window.q_table({
              "target": target,
              "props": {
                componentConfiguration: props
              }
            })
          })();`,
                    },
                ],
                markup: `<div id="${id}_container" class="q-table-container"></div>`,
            };
            if (styleHashMap !== null) {
                renderingInfo.stylesheets.push({
                    name: styleHashMap['q-table'],
                });
            }
            return renderingInfo;
        });
    },
};
function areMinibarsAvailable(request, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.server.inject({
            url: '/option-availability/selectedColumnMinibar',
            method: 'POST',
            payload: { item: config },
        });
        const result = response.result;
        if (result) {
            return result.available;
        }
        else {
            console.log('Error receiving result for /option-availability/selectedColumnMinibar', result);
            return false;
        }
    });
}
function isColorColumnAvailable(request, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.server.inject({
            url: '/option-availability/selectedColorColumn',
            method: 'POST',
            payload: { item: config },
        });
        const result = response.result;
        if (result) {
            return result.available;
        }
        else {
            console.log('Error receiving result for /option-availability/selectedColorColumn', result);
            return false;
        }
    });
}
function createId(request) {
    return `q_table_${request.query._id}_${Math.floor(Math.random() * 100000)}`.replace(/-/g, '');
}
function calculatePageSize(totalAmountOfRows, initWithCardLayout, options, toolRuntimeConfig) {
    const { pageSize } = options;
    // if we have noInteraction, we do not hide rows because showing them is not possible.
    if (toolRuntimeConfig.noInteraction === true) {
        return totalAmountOfRows;
    }
    // Use the user provided pagesize above
    // auto calculated ones.
    if (typeof pageSize === 'number') {
        return pageSize;
    }
    if (initWithCardLayout && totalAmountOfRows >= 6) {
        return 3;
    }
    if (totalAmountOfRows >= 15) {
        return 10;
    }
    return totalAmountOfRows;
}
function getInitWithCardLayoutFlag(width, options) {
    const { cardLayout, cardLayoutIfSmall } = options;
    if (cardLayout === true) {
        return true;
    }
    if (typeof width === 'number' && width <= 400 && cardLayoutIfSmall === true) {
        return true;
    }
    return false;
}

const __dirname$1 = dirname(fileURLToPath(import.meta.url));
const route$j = {
    method: 'GET',
    path: '/stylesheet/{filename}.{hash}.{extension}',
    options: {
        files: {
            relativeTo: path.join(__dirname$1, '/styles/'),
        },
    },
    handler: function (request, h) {
        const params = request.params;
        // For some reason after updating deps on 7.1.5 ts is not detecting the
        // type of h.file() and is complaining about the return type.
        // @ts-ignore
        // eslint-disable-next-line
        return h.file(`${params.filename}.${params.extension}`)
            .type('text/css')
            .header('cache-control', `max-age=${60 * 60 * 24 * 365}, immutable`); // 1 year
    },
};

var optionAvailability = {
    method: 'POST',
    path: '/option-availability/{optionName}',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const optionName = request.params.optionName;
        if (optionName === 'cardLayoutIfSmall') {
            return {
                available: !item.options.cardLayout,
            };
        }
        if (optionName === 'showTableSearch') {
            return {
                available: item.data.table.length > 16,
            };
        }
        if (optionName === 'minibars' || optionName === 'selectedColumnMinibar') {
            let isAvailable = false;
            if (item.data.table.length !== 0) {
                if (!item.options.cardLayout && item.data.table[0].length >= 2 && getNumericColumns(item.data.table).length >= 1) {
                    isAvailable = true;
                }
            }
            return {
                available: isAvailable,
            };
        }
        // properties minibar
        if (item.options.minibar !== null && item.options.minibar !== undefined) {
            if (optionName === 'barColor') {
                const isAvailable = item.options.minibar.selectedColumn !== null && item.options.minibar.selectedColumn !== undefined;
                return {
                    available: isAvailable,
                };
            }
            if (optionName === 'barColorPositive') {
                if (typeof item.options.minibar.selectedColumn === 'number') {
                    const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    return {
                        available: type === MINIBAR_TYPE.MIXED || type === MINIBAR_TYPE.POSITIVE,
                    };
                }
            }
            if (optionName === 'barColorNegative') {
                if (typeof item.options.minibar.selectedColumn === 'number') {
                    const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    return {
                        available: type === MINIBAR_TYPE.MIXED || type === MINIBAR_TYPE.NEGATIVE,
                    };
                }
            }
            if (optionName === 'invertColors') {
                if (typeof item.options.minibar.selectedColumn === 'number') {
                    const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    return {
                        available: type === MINIBAR_TYPE.MIXED,
                    };
                }
            }
        }
        if (optionName === 'colorColumn' || optionName === 'selectedColorColumn') {
            let isAvailable = false;
            if (item.data.table.length > 2) {
                if (!item.options.cardLayout && item.data.table[0].length >= 2 && item.data.table.length >= 1) {
                    isAvailable = true;
                }
            }
            return {
                available: isAvailable,
            };
        }
        // properties colorColumn
        if (item.options.colorColumn !== null && item.options.colorColumn !== undefined) {
            if (optionName === 'isNumerical') {
                return {
                    available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.colorColumnType === 'numerical',
                };
            }
            if (optionName === 'isCategorical') {
                return {
                    available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.colorColumnType === 'categorical',
                };
            }
            if (['colorColumnType', 'bucketType', 'colorScale', 'colorOverwritesItem', 'colorScheme', 'customCategoriesOrder'].includes(optionName)) {
                return {
                    available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined,
                };
            }
            if (optionName === 'customBuckets') {
                let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === 'numberBuckets') {
                let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = !hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === 'customColors') {
                let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = item.options.colorColumn.numericalOptions.scale === 'sequential' || item.options.colorColumn.colorColumnType === 'categorical';
                }
                return {
                    available: isAvailable,
                };
            }
        }
        return Boom.badRequest();
    },
};

const route$i = {
    method: 'POST',
    path: '/dynamic-schema/colorScheme',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const options = payload.item.options;
        const numericalOptions = options.colorColumn.numericalOptions;
        if (numericalOptions.scale === 'sequential') {
            return {
                enum: ['one', 'two', 'three', 'female', 'male'],
                'Q:options': {
                    enum_titles: ['Schema 1 (Standard)', 'Schema 2 (Standard-Alternative)', 'Schema 3 (negative Bedeutung)', 'Schema weiblich', 'Schema männlich'],
                },
            };
        }
        return {
            enum: ['one', 'two', 'three', 'gender'],
            'Q:options': {
                enum_titles: ['Schema 1 (Standard negativ/positiv)', 'Schema 2 (neutral)', 'Schema 3 (Alternative negativ/positiv)', 'Schema weiblich/männlich'],
            },
        };
    },
};

const route$h = {
    method: 'POST',
    path: '/dynamic-schema/colorOverwrites',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        const colorColumnSettings = item.options.colorColumn;
        const colorColumnType = colorColumnSettings.colorColumnType;
        if (colorColumnType === 'numerical') {
            return getMaxItemsNumerical(colorColumnSettings);
        }
        else {
            return getMaxItemsCategorical(data, colorColumnSettings);
        }
    },
};
function getMaxItemsNumerical(colorColumnSettings) {
    return {
        maxItems: getNumberBuckets(colorColumnSettings),
    };
}
function getMaxItemsCategorical(data, colorColumnSettings) {
    try {
        data = getDataWithoutHeaderRow(data);
        return {
            maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
        };
    }
    catch (_a) {
        return {
            maxItems: undefined,
        };
    }
}

const route$g = {
    method: 'POST',
    path: '/dynamic-schema/colorOverwritesItem',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        const colorColumnSettings = item.options.colorColumn;
        const colorColumnType = colorColumnSettings.colorColumnType;
        if (colorColumnType === 'numerical') {
            return getDropdownSettingsNumerical(colorColumnSettings);
        }
        else {
            return getDropdownSettingsCategorical(data, colorColumnSettings);
        }
    },
};
function getDropdownSettingsNumerical(colorColumnSettings) {
    const ids = [];
    const titles = [];
    const numberItems = getNumberBuckets(colorColumnSettings);
    for (let i = 0; i < numberItems; i++) {
        ids.push(i);
        titles.push(`${i + 1}. Bucket `);
    }
    return {
        enum: ids,
        'Q:options': {
            enum_titles: titles,
        },
    };
}
function getDropdownSettingsCategorical(data, colorColumnSettings) {
    data = getDataWithoutHeaderRow(data);
    const categories = getUniqueCategoriesObject(data, colorColumnSettings).categories;
    const titles = [''];
    const enumValues = [null];
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const id = i + 1;
        const title = `${id} - ${category}`;
        enumValues.push(id);
        titles.push(title);
    }
    return {
        enum: enumValues,
        'Q:options': {
            enum_titles: titles,
        },
    };
}

const route$f = {
    method: 'POST',
    path: '/dynamic-schema/customCategoriesOrder',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = getDataWithoutHeaderRow(item.data.table);
        const colorColumnSettings = item.options.colorColumn;
        return {
            maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
        };
    },
};

const route$e = {
    method: 'POST',
    path: '/dynamic-schema/customCategoriesOrderItem',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = getDataWithoutHeaderRow(item.data.table);
        const colorColumnSettings = item.options.colorColumn;
        const categories = getUniqueCategoriesObject(data, colorColumnSettings).categories;
        return {
            enum: categories,
            'Q:options': {
                enum_titles: categories,
            },
        };
    },
};

const route$d = {
    method: 'POST',
    path: '/dynamic-schema/getColumnAmount',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        return {
            maxItems: data[0].length
        };
    },
};

const route$c = {
    method: 'POST',
    path: '/dynamic-schema/getEachColumn',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        const ids = [];
        const titles = [];
        for (let i = 0; i < data[0].length; i++) {
            const d = data[0][i];
            ids.push(i);
            titles.push(d);
        }
        return {
            enum: ids,
            'Q:options': {
                enum_titles: titles,
            },
        };
    },
};

const route$b = {
    method: 'POST',
    path: '/dynamic-schema/getOptionsCountryFlagSelect',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getOptions(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
function getOptions(data) {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    if (data.length > 0) {
        const columnTypes = getColumnsType(data);
        data[0].forEach((head, index) => {
            if (columnTypes[index].type === 'text') {
                dropdownSettings.ids.push(index);
                dropdownSettings.titles.push(head);
            }
        });
    }
    return dropdownSettings;
}

const route$a = {
    method: 'POST',
    path: '/dynamic-schema/selectedColumnMinibar',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getMinibarDropdownSettings(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
function getMinibarDropdownSettings(data) {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    // If data is available we all add all numeric columns to the dropdown.
    if (data.length > 0) {
        const columns = getNumericColumns(data);
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            dropdownSettings.ids.push(column.index);
            dropdownSettings.titles.push(column.title);
        }
    }
    return dropdownSettings;
}

const route$9 = {
    method: 'POST',
    path: '/dynamic-schema/selectedColorColumn',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getDropdownSettings(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
function getDropdownSettings(data) {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    // If data is available we all add all numeric columns to the dropdown.
    if (data.length > 0) {
        const columns = getCategoricalColumns(data);
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            dropdownSettings.ids.push(column.index);
            dropdownSettings.titles.push(column.title);
        }
    }
    return dropdownSettings;
}

// TODO Refactor common functionality with selectedColorColum.ts and selectedColumnMinibar.ts
const route$8 = {
    method: 'POST',
    path: '/dynamic-schema/selectedFrozenRow',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getFrozenRowDropdownSettings(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
/**
 * Internal.
 */
const getFrozenRowDropdownSettings = (data) => {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    // Omit if data only contains a title row
    if (data.length > 1) {
        const [, ...rows] = data;
        dropdownSettings.ids = dropdownSettings.ids.concat(rows.map((d, i) => i));
        dropdownSettings.titles = dropdownSettings.titles.concat(rows.map((d, i) => (i + 2).toString()));
    }
    return dropdownSettings;
};

const route$7 = {
    method: 'POST',
    path: '/dynamic-schema/colorScale',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const numericalOptions = item.options.colorColumn.numericalOptions;
        const enumValues = ['sequential'];
        const enumTitles = ['Sequentiell'];
        let bucketNumber = 0;
        if (numericalOptions.bucketType === 'custom') {
            if (numericalOptions.customBuckets) {
                const buckets = numericalOptions.customBuckets.split(',');
                bucketNumber = buckets.length - 1;
            }
        }
        else {
            bucketNumber = numericalOptions.numberBuckets;
        }
        // Add valid bucket borders to enum as diverging values.
        for (let i = 1; i < bucketNumber; i++) {
            enumValues.push(`border-${i}`);
            enumTitles.push(`Divergierend ab Grenze ${i}`);
        }
        // Add valid buckets to enum as diverging values.
        for (let i = 1; i < bucketNumber - 1; i++) {
            enumValues.push(`bucket-${i}`);
            enumTitles.push(`Divergierend ab Bucket ${i + 1}`);
        }
        return {
            enum: enumValues,
            'Q:options': {
                enum_titles: enumTitles,
            },
        };
    },
};

const route$6 = {
    method: 'POST',
    path: '/dynamic-schema/sortingDirectionItem',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function () {
        // const payload = request.payload as Payload;
        // const item = payload.item;
        // const data = item.data.table;
        const ids = [null];
        const titles = [''];
        // We only support one column to be auto sorted.
        // But don't know how to make sure the select of the current auto sorted
        // column does not get it's options deleted.
        // This code affects all selects.
        // const m = item.options.sorting?.find(s => s.sortingDirection !== null);
        // if (!m) {
        ids.push('asc', 'desc');
        titles.push('Ascending', 'Decending');
        // }
        return {
            enum: ids,
            'Q:options': {
                enum_titles: titles,
            },
        };
    },
};

var dynamicSchemas = [
    route$i,
    route$h,
    route$g,
    route$f,
    route$e,
    route$d,
    route$c,
    route$b,
    route$9,
    route$a,
    route$8,
    route$7,
    route$6,
];

const route$5 = {
    path: '/health',
    method: 'GET',
    options: {
        tags: ['api'],
    },
    handler: () => {
        return 'ok';
    },
};

function migrate$1(uncastedItem) {
    const item = uncastedItem;
    const result = {
        isChanged: false,
        item: null,
    };
    if (item.options.minibar === undefined) {
        const parsedNumber = parseInt(item.options.minibarOptions || '');
        if (!isNaN(parsedNumber)) {
            const minibars = {
                selectedColumn: parsedNumber + 1,
                barColor: {
                    positive: {
                        className: '',
                        colorCode: '',
                    },
                    negative: {
                        className: '',
                        colorCode: '',
                    },
                },
                invertColors: false,
            };
            item.options['minibar'] = minibars;
            delete item.options.minibarOptions;
            result.isChanged = true;
        }
        else {
            delete item.options.minibarOptions;
            result.isChanged = true;
        }
    }
    result.item = item;
    return result;
}

var migrationToV2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    migrate: migrate$1
});

function migrate(uncastedItem) {
    const item = uncastedItem;
    const data = item.data;
    const result = {
        isChanged: false,
        item: null,
    };
    let metaData = null;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        metaData = data.metaData;
    }
    if (metaData === undefined || metaData === null) {
        const castedData = data;
        const slicedData = castedData.slice();
        item.data = {
            table: slicedData,
            metaData: {
                cells: [],
            },
        };
        result.isChanged = true;
    }
    result.item = item;
    return result;
}

var migrationToV3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    migrate: migrate
});

// register migration scripts here in order of version,
// i.e. list the smallest version first!
const migrationScripts = [migrationToV2, migrationToV3];
const route$4 = {
    method: 'POST',
    path: '/migration',
    options: {
        validate: {
            payload: {
                item: Joi.object().required(),
            },
        },
    },
    handler: (request, h) => {
        const payload = request.payload;
        let item = payload.item;
        const results = migrationScripts.map(script => {
            const result = script.migrate(item);
            if (result.isChanged) {
                item = result.item;
            }
            return result;
        });
        const isChanged = results.findIndex(result => {
            return result.isChanged;
        });
        if (isChanged >= 0) {
            return {
                item: item,
            };
        }
        return h.response().code(304);
    },
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = __dirname + '/../../resources/locales/';
const route$3 = {
    path: '/locales/{lng}/translation.json',
    method: 'GET',
    options: {
        description: 'Returns translations for given language',
        tags: ['api'],
        validate: {
            params: {
                lng: Joi.string().required(),
            },
        },
    },
    handler: (request, h) => {
        const params = request.params;
        // For some reason after updating deps on 7.1.5 ts is not detecting the
        // type of h.file() and is complaining about the return type.
        // @ts-ignore
        // eslint-disable-next-line
        return h.file(localesDir + params.lng + '/translation.json').type('application/json');
    },
};

var title$f = "FIXTURE: All question types with images";
var department = "Storytelling / Infografik";
var publication = "nzz";
var acronym = "mro";
var elements$f = [
	{
		id: "cd11d746cd1d1b6018d83e00b701e899-1532100973311-320454144",
		type: "multipleChoice",
		choices: [
			"Engelberg",
			"Adelboden",
			"Stoos"
		],
		articleRecommendations: [
		],
		introduction: "Skifans können es jedes Jahr kaum erwarten, bis der erste Schnee aus Berghängen Pisten macht und die Gondeln sich in Bewegung setzen.",
		image: {
			url: "https://nzz-q-assets-stage.s3.eu-west-1.amazonaws.com/2018/07/20/0906aa61-f5ce-4c64-8d93-9919ae2542ce.jpeg",
			key: "2018/07/20/0906aa61-f5ce-4c64-8d93-9919ae2542ce.jpeg",
			size: 266724,
			width: 1280,
			height: 855
		},
		question: "Welcher Schweizer Ort gilt als Wiege oder auch Geburtsort des Wintersports?",
		answer: "St.Moritz"
	},
	{
		id: "cd11d746cd1d1b6018d83e00b701e899-1532101097031-10309866",
		type: "numberGuess",
		articleRecommendations: [
		],
		introduction: "Für den Winter 2016/2017 hatte Saas-Fee eine Marketing-Aktion gestartet. ",
		image: {
		},
		question: "Statt für regulär Fr. 1050 gab es das Saison-Ticket für ...",
		answer: 222,
		min: 100,
		max: 1000,
		step: 2,
		answerText: "2016 gab es in Saas-Fee eine kleine Revolution. Statt für 1050 Fr. stand die Saisonkarte für 222 Fr. zum Verkauf. Dies allerdings nur, wenn innert fünf Wochen via Crowdfunding 99 999 Personen das Billet kaufen würden. Der Marketing-Coup funktionierte und war ein Weckruf für die ganze Schweizer Ski-Tourismus-Branche. Ihre Schätzung liegt um 117 Prozent zu hoch. Sie haben damit besser geschätzt als 26 Prozent aller anderen."
	},
	{
		id: "cd11d746cd1d1b6018d83e00b701e899-1532101186644-655788839",
		type: "mapPointGuess",
		answer: {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [
					9.8459437,
					46.498021
				]
			},
			properties: {
				label: "St. Moritz"
			},
			bbox: [
				6.23748779296875,
				45.02500920723146,
				13.444519042968752,
				47.818687628247105
			]
		},
		articleRecommendations: [
		],
		question: "Wo liegt St.Moritz?",
		introduction: "",
		image: {
			url: "https://nzz-q-assets-stage.s3.eu-west-1.amazonaws.com/2018/07/20/65ed8661-e5c9-4de4-97fc-4c8402dd0b9e.jpeg",
			key: "2018/07/20/65ed8661-e5c9-4de4-97fc-4c8402dd0b9e.jpeg",
			size: 266724,
			width: 1280,
			height: 855
		}
	}
];
var allQuestionTypesWithImages = {
	title: title$f,
	department: department,
	publication: publication,
	acronym: acronym,
	elements: elements$f
};

var title$e = "FIXTURE: Vollständiges Quiz (Cover, Fragetypen, letzte Seite)";
var elements$e = [
	{
		id: "quiz-0-1503673199200-897399321",
		type: "cover"
	},
	{
		id: "quiz-0-1503673205043-233776299",
		type: "multipleChoice",
		image: {
		},
		choices: [
			"vielleicht",
			"falsch",
			"absolut falsch"
		],
		articleRecommendations: [
		],
		question: "Was ist die richtige Antwort?",
		answer: "richtig"
	},
	{
		id: "quiz-0-1503673244888-827300797",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Hausnummer der NZZ",
		answer: 11,
		min: 1,
		max: 20,
		step: 1
	},
	{
		id: "quiz-0-1503673375520-572013568",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Temperatur",
		answer: 25,
		min: 1,
		max: 35,
		step: 1
	},
	{
		id: "quiz-0-1503673602641-999859280",
		type: "mapPointGuess",
		answer: {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [
					8.548714,
					47.3664
				]
			},
			properties: {
				pointLabel: "NZZ Red",
				label: "11 Falkenstrasse"
			},
			bbox: [
				8.50547790527344,
				47.347779215247144,
				8.591995239257814,
				47.38498483918202
			]
		},
		image: {
		},
		articleRecommendations: [
		],
		question: "wo ist die nzz?"
	},
	{
		id: "quiz-0-1503673653497-139543834",
		type: "mapPointGuess",
		answer: {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [
					13.42632293701172,
					51.456574106519724
				]
			},
			properties: {
				pointLabel: "Kuhkaff",
				label: "Röderland"
			},
			bbox: [
				2.4169921875000004,
				46.830133640447414,
				24.565429687500004,
				55.60317816902704
			]
		},
		image: {
		},
		articleRecommendations: [
		],
		question: "wo kommt sharon her?"
	},
	{
		id: "quiz-0-1503673375520-572013999",
		type: "numberPoll",
		image: {
		},
		articleRecommendations: [
		],
		question: "Temperatur",
		min: 1,
		max: 35,
		step: 1
	},
	{
		id: "quiz-0-1503673750136-872919612",
		type: "lastCard",
		title: "Geschafft. Danke fürs Mitspielen.",
		quizLink: "https://www.nzz.ch/feuilleton/nzz-quizz-twin-peaks-kehrt-zurueck-ld.1294313",
		quizTitle: "Was wissen Sie über Twin Peaks",
		isFinalScoreShown: true,
		articleRecommendations: [
		],
		text: "Ui so ein Spass"
	}
];
var all = {
	title: title$e,
	elements: elements$e
};

var title$d = "FIXTURE: Ein Quiz mit Cover mit Titel, alle Fragetypen, ohne letzte Seite";
var elements$d = [
	{
		id: "quiz-1-1503673199200-897399321",
		title: "Ein tolles Quiz",
		type: "cover"
	},
	{
		id: "quiz-1-1503673205043-233776299",
		type: "multipleChoice",
		image: {
			url: "https://nzz-q-assets-stage.s3.eu-west-1.amazonaws.com/2018/02/05/ea4995ff-38d9-4ba2-a6b4-f8707f98b57c.png",
			key: "2018/02/05/ea4995ff-38d9-4ba2-a6b4-f8707f98b57c.png",
			size: 14577,
			width: 902,
			height: 168
		},
		choices: [
			"vielleicht",
			"falsch",
			"absolut falsch"
		],
		articleRecommendations: [
		],
		question: "Was ist die richtige Antwort?",
		answer: "richtig"
	},
	{
		id: "quiz-1-1503673244888-827300797",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Hausnummer der NZZ",
		answer: 11,
		min: 1,
		max: 20,
		step: 1
	},
	{
		id: "quiz-1-1503673602641-999859280",
		type: "mapPointGuess",
		answer: {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [
					8.548714,
					47.3664
				]
			},
			properties: {
				pointLabel: "NZZ Red",
				label: "11 Falkenstrasse"
			},
			bbox: [
				8.50547790527344,
				47.347779215247144,
				8.591995239257814,
				47.38498483918202
			]
		},
		image: {
		},
		articleRecommendations: [
		],
		question: "wo ist die nzz?"
	}
];
var coverWithTitleNoLastCard = {
	title: title$d,
	elements: elements$d
};

var title$c = "FIXTURE: Number guess - single big number question quiz";
var elements$c = [
	{
		id: "quiz-3-1503673375520-572013569",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Zurück in die Gegenwart: Wieviele Katzen leben in der Schweiz?",
		answer: 5000000,
		min: 1000000,
		max: 10000000,
		step: 500000
	}
];
var singleBigNumberGuess = {
	title: title$c,
	elements: elements$c
};

var title$b = "FIXTURE: Number poll - single question big number quiz";
var elements$b = [
	{
		id: "quiz-9-1620205109920-228181337",
		type: "numberPoll",
		articleRecommendations: [
		],
		introduction: "This is the introduction",
		question: "Test Frage",
		questionSubTitle: "Test Subtitle",
		answer: 5000000,
		min: 1000000,
		max: 10000000,
		step: 1000000
	}
];
var singleBigNumberPoll = {
	title: title$b,
	elements: elements$b
};

var title$a = "FIXTURE: Number guess - single big number small step question quiz";
var elements$a = [
	{
		id: "quiz-3-1503673375520-572013569",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Zurück in die Gegenwart: Wieviele Katzen leben in der Schweiz?",
		answer: 5000000,
		min: 1000000,
		max: 10000000,
		step: 10000
	}
];
var singleBigNumberSmallStepGuess = {
	title: title$a,
	elements: elements$a
};

var title$9 = "FIXTURE: Number guess - single float number question quiz";
var elements$9 = [
	{
		id: "quiz-3-1503673375520-572013569",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Zurück in die Gegenwart: Wieviele Mammuths leben in der Schweiz?",
		answer: 1.5,
		min: 0.1,
		max: 2.5,
		step: 0.1
	}
];
var singleFloatNumberGuess = {
	title: title$9,
	elements: elements$9
};

var title$8 = "FIXTURE: Number poll - single question float number quiz";
var elements$8 = [
	{
		id: "quiz-9-1620205109920-228181337",
		type: "numberPoll",
		articleRecommendations: [
		],
		introduction: "This is the introduction",
		question: "Test Frage",
		questionSubTitle: "Test Subtitle",
		answer: 0.5,
		min: 0.1,
		max: 2.5,
		step: 0.1
	}
];
var singleFloatNumberPoll = {
	title: title$8,
	elements: elements$8
};

var title$7 = "FIXTURE: Map point guess - single question quiz - high zoomlevel";
var elements$7 = [
	{
		id: "quiz-4-1503673602641-999859481",
		type: "mapPointGuess",
		answer: {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [
					-5.3541295,
					36.140807
				]
			},
			properties: {
				pointLabel: "Gibraltar",
				label: "Gibraltar"
			},
			bbox: [
				-5.775815499946477,
				35.853446294384455,
				-5.429746164008977,
				36.03133843611641
			]
		},
		image: {
			url: "https://nzz-q-assets-stage.s3.eu-west-1.amazonaws.com/2018/02/05/d93b5299-a21f-4bb0-bc9d-cd08b61674a9.jpeg",
			key: "2018/02/05/d93b5299-a21f-4bb0-bc9d-cd08b61674a9.jpeg",
			size: 24361,
			width: 380,
			height: 230
		},
		articleRecommendations: [
		],
		question: "Wo ist Gibraltar?"
	}
];
var singleMapPointGuessHighZoomlevel = {
	title: title$7,
	elements: elements$7
};

var title$6 = "FIXTURE: Map point guess - single question quiz - low zoomlevel";
var elements$6 = [
	{
		id: "quiz-4-1503673602641-999859451",
		type: "mapPointGuess",
		answer: {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [
					-5.3541295,
					36.140807
				]
			},
			properties: {
				pointLabel: "Gibraltar",
				label: "Gibraltar"
			},
			bbox: [
				-13.999572694301607,
				32.17330357945741,
				30.2973023056984,
				52.64140823072469
			]
		},
		image: {
			url: "https://nzz-q-assets-stage.s3.eu-west-1.amazonaws.com/2018/02/05/d93b5299-a21f-4bb0-bc9d-cd08b61674a9.jpeg",
			key: "2018/02/05/d93b5299-a21f-4bb0-bc9d-cd08b61674a9.jpeg",
			size: 24361,
			width: 380,
			height: 230
		},
		articleRecommendations: [
		],
		question: "Wo ist Gibraltar?"
	}
];
var singleMapPointGuessLowZoomlevel = {
	title: title$6,
	elements: elements$6
};

var title$5 = "FIXTURE: Map point guess - single question quiz";
var elements$5 = [
	{
		id: "quiz-4-1503673602641-999859280",
		type: "mapPointGuess",
		answer: {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [
					8.548714,
					47.3664
				]
			},
			properties: {
				pointLabel: "NZZ Red",
				label: "11 Falkenstrasse"
			},
			bbox: [
				8.50547790527344,
				47.347779215247144,
				8.591995239257814,
				47.38498483918202
			]
		},
		image: {
		},
		articleRecommendations: [
		],
		question: "wo ist die nzz?"
	}
];
var singlemapPointGuess = {
	title: title$5,
	elements: elements$5
};

var title$4 = "FIXTURE: Multiple choice - single question quiz";
var elements$4 = [
	{
		id: "quiz-2-1503673205043-233776299",
		type: "multipleChoice",
		image: {
		},
		choices: [
			"vielleicht",
			"falsch",
			"mal noch ein längere Antwort: Der Teamwettbewerb für Männer und Frauen im Ski Alpin, das Mixed-Doppel im Curling, der Massenstart im Eisschnelllaufen und der Big-Air-Wettbewerb im Snowboarden"
		],
		articleRecommendations: [
		],
		question: "Was ist die richtige Antwort?",
		answer: "richtig"
	}
];
var singleMultipleChoice = {
	title: title$4,
	elements: elements$4
};

var title$3 = "FIXTURE: Number guess - single question quiz";
var elements$3 = [
	{
		id: "quiz-3-1503673375520-572013569",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Wie alt ist Andrin?",
		answer: 17,
		min: 1,
		max: 45,
		step: 1
	}
];
var singleNumberGuessAndrin = {
	title: title$3,
	elements: elements$3
};

var title$2 = "FIXTURE: Number guess - single question quiz";
var elements$2 = [
	{
		id: "quiz-3-1503673375520-572013568",
		type: "numberGuess",
		image: {
		},
		articleRecommendations: [
		],
		question: "Temperatur",
		answer: 25,
		min: 1,
		max: 35,
		step: 1
	}
];
var singleNumberGuess = {
	title: title$2,
	elements: elements$2
};

var title$1 = "FIXTURE: Number poll - single question quiz";
var elements$1 = [
	{
		id: "quiz-9-1620205109920-228184695",
		type: "numberPoll",
		articleRecommendations: [
		],
		introduction: "This is the introduction",
		question: "Test Frage",
		questionSubTitle: "Test Subtitle",
		answer: 0,
		min: 1,
		max: 10,
		step: 1
	}
];
var singleNumberPoll = {
	title: title$1,
	elements: elements$1
};

var title = "FIXTURE: Number guess - stripplot";
var elements = [
	{
		id: "5-1574250413809-187227046",
		type: "numberGuess",
		articleRecommendations: [
		],
		question: "Wie viele",
		answer: 75,
		min: 1,
		max: 150,
		step: 1
	}
];
var stripPlotNumberGuess = {
	title: title,
	elements: elements
};

const fixtureData = [
    allQuestionTypesWithImages,
    all,
    coverWithTitleNoLastCard,
    singleBigNumberGuess,
    singleBigNumberPoll,
    singleBigNumberSmallStepGuess,
    singleFloatNumberGuess,
    singleFloatNumberPoll,
    singleMapPointGuessHighZoomlevel,
    singleMapPointGuessLowZoomlevel,
    singlemapPointGuess,
    singleMultipleChoice,
    singleNumberGuessAndrin,
    singleNumberGuess,
    singleNumberPoll,
    stripPlotNumberGuess,
];
const route$2 = {
    path: '/fixtures/data',
    method: 'GET',
    options: {
        tags: ['api'],
    },
    handler: () => {
        return fixtureData;
    },
};

var DivergingType;
(function (DivergingType) {
    DivergingType["BUCKET"] = "bucket";
    DivergingType["BORDER"] = "border";
})(DivergingType || (DivergingType = {}));

const sequentialScaleMax = 7;
const divergingScaleMax = sequentialScaleMax * 2;
const route$1 = {
    method: 'POST',
    path: '/notification/numberBucketsOutOfColorScale',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const colorColumnSettings = item.options.colorColumn;
            const { colorColumnType, numericalOptions } = colorColumnSettings;
            const scale = numericalOptions.scale;
            if (colorColumnType === 'numerical') {
                const numberBuckets = getNumberBuckets(colorColumnSettings);
                if (scale === 'sequential' && numberBuckets > sequentialScaleMax) {
                    return {
                        message: {
                            title: 'notifications.numberBucketsOutOfColorScale.title',
                            body: 'notifications.numberBucketsOutOfColorScale.body',
                        },
                    };
                }
                else {
                    const divergingSpec = scale.split('-');
                    const divergingType = divergingSpec[0];
                    const divergingIndex = parseInt(divergingSpec[1]);
                    const numberBucketsLeft = divergingIndex;
                    let numberBucketsRight = numberBuckets - divergingIndex;
                    if (divergingType === DivergingType.BUCKET) {
                        numberBucketsRight -= 1;
                    }
                    const numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
                    let scaleSize = numberBucketsBiggerSide * 2;
                    if (divergingType === DivergingType.BUCKET) {
                        scaleSize += 1;
                    }
                    if (scaleSize > divergingScaleMax) {
                        return {
                            message: {
                                title: 'notifications.numberBucketsOutOfColorScale.title',
                                body: 'notifications.numberBucketsOutOfColorScale.body',
                            },
                        };
                    }
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberBucketsOutOfColorScale', err);
        }
        return null;
    },
};

var numberBucketsExceedsDataSet = {
    method: 'POST',
    path: '/notification/numberBucketsExceedsDataSet',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const data = getDataWithoutHeaderRow(item.data.table);
            const colorColumnSettings = item.options.colorColumn;
            const { numericalOptions } = colorColumnSettings;
            if (numericalOptions.bucketType !== 'custom') {
                const numberUniqueValues = getUniqueCategoriesCount(data, colorColumnSettings);
                const numberBuckets = numericalOptions.numberBuckets;
                if (numberBuckets > numberUniqueValues) {
                    return {
                        message: {
                            title: 'notifications.numberBucketsExceedsDataSet.title',
                            body: 'notifications.numberBucketsExceedsDataSet.body',
                        },
                    };
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberBucketsExceedsDataSet', err);
        }
        return null;
    },
};

const numberMainColors = digitWords.length;
const route = {
    method: 'POST',
    path: '/notification/numberCategoriesOutOfColorScale',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const colorColumnSettings = item.options.colorColumn;
            if (item.options.colorColumn.colorColumnType === 'categorical') {
                const tableData = getDataWithoutHeaderRow(item.data.table);
                const numberUniqueValues = getUniqueCategoriesCount(tableData, colorColumnSettings);
                if (numberUniqueValues > numberMainColors) {
                    return {
                        message: {
                            title: 'notifications.numberCategoriesOutOfColorScale.title',
                            body: 'notifications.numberCategoriesOutOfColorScale.body',
                        },
                    };
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberCategoriesOutOfColorScale', err);
        }
        return null;
    },
};

var customBuckets = {
    method: 'POST',
    path: '/notification/customBuckets',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const data = getDataWithoutHeaderRow(item.data.table);
            const colorColumnSettings = item.options.colorColumn;
            const { numericalOptions, selectedColumn } = colorColumnSettings;
            const { bucketType, customBuckets } = numericalOptions;
            if (bucketType === 'custom' && typeof selectedColumn === 'number') {
                const bucketBorders = getCustomBucketBorders(customBuckets);
                const values = getNumericalValuesByColumn(data, selectedColumn);
                const numberValues = getNonNullValues(values);
                const metaData = getMetaData(values, numberValues, 0);
                if (bucketBorders[0] > metaData.minValue || bucketBorders[bucketBorders.length - 1] < metaData.maxValue) {
                    return {
                        message: {
                            title: 'notifications.customBuckets.title',
                            body: 'notifications.customBuckets.body',
                        },
                    };
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/customBuckets', err);
        }
        return null;
    },
};

const schemaRoute = {
    method: 'GET',
    path: '/schema.json',
    handler: function (request, h) {
        return h.response(schema$1);
    },
};
var schema = [schemaRoute];

const allRoutes = [
    route$k,
    route$j,
    optionAvailability,
    ...dynamicSchemas,
    route$5,
    route$4,
    route$3,
    route$2,
    route$1,
    numberBucketsExceedsDataSet,
    route,
    customBuckets,
    ...schema,
];

export { allRoutes as default };
