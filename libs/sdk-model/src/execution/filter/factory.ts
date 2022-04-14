// (C) 2019-2022 GoodData Corporation
import invariant from "ts-invariant";
import isNil from "lodash/isNil";
import {
    ComparisonConditionOperator,
    IAbsoluteDateFilter,
    IAttributeElements,
    IMeasureValueFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
    RangeConditionOperator,
    IRankingFilter,
    RankingFilterOperator,
    IFilter,
} from "./index";
import { attributeDisplayFormRef, IAttribute, isAttribute, attributeLocalId } from "../attribute";
import { Identifier, isObjRef, LocalIdRef, ObjRef, ObjRefInScope } from "../../objRef";
import { IMeasure, isMeasure, measureLocalId } from "../measure";
import { idRef, localIdRef } from "../../objRef/factory";
import { DateAttributeGranularity } from "../../base/dateGranularities";

/**
 * Creates a new positive attribute filter.
 *
 * @remarks
 * NOTE: when specifying attribute element using URIs (primary keys), please keep in mind that they MAY NOT be transferable
 * across workspaces. On some backends (such as bear) same element WILL have different URI in each workspace.
 * In general we recommend using URIs only if your code retrieves them at runtime from backend using elements query
 * or from the data view's headers. Hardcoding URIs is never a good idea, if you find yourself doing that,
 * please consider specifying attribute elements by value
 *
 * @param attributeOrRef - either instance of attribute to create filter for or ref or identifier of attribute's display form
 * @param inValues - values to filter for; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_; if you specify empty array, then the filter will be noop and will be ignored
 * @public
 */
export function newPositiveAttributeFilter(
    attributeOrRef: IAttribute | ObjRef | Identifier,
    inValues: IAttributeElements | string[],
): IPositiveAttributeFilter {
    const objRef = isObjRef(attributeOrRef)
        ? attributeOrRef
        : typeof attributeOrRef === "string"
        ? idRef(attributeOrRef)
        : attributeDisplayFormRef(attributeOrRef);

    const inObject: IAttributeElements = Array.isArray(inValues) ? { values: inValues } : inValues;

    return {
        positiveAttributeFilter: {
            displayForm: objRef,
            in: inObject,
        },
    };
}

/**
 * Creates a new negative attribute filter.
 *
 * @remarks
 * NOTE: when specifying attribute element using URIs (primary keys), please keep in mind that they MAY NOT be transferable
 * across workspaces. On some backends (such as bear) same element WILL have different URI in each workspace.
 * In general we recommend using URIs only if your code retrieves them at runtime from backend using elements query
 * or from the data view's headers. Hardcoding URIs is never a good idea, if you find yourself doing that,
 * please consider specifying attribute elements by value
 *
 * @param attributeOrRef - either instance of attribute to create filter for or ref or identifier of attribute's display form
 * @param notInValues - values to filter out; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_; if you specify empty array, then the filter will be noop and will be ignored
 * @public
 */
export function newNegativeAttributeFilter(
    attributeOrRef: IAttribute | ObjRef | Identifier,
    notInValues: IAttributeElements | string[],
): INegativeAttributeFilter {
    const objRef = isObjRef(attributeOrRef)
        ? attributeOrRef
        : typeof attributeOrRef === "string"
        ? idRef(attributeOrRef)
        : attributeDisplayFormRef(attributeOrRef);

    const notInObject: IAttributeElements = Array.isArray(notInValues)
        ? { values: notInValues }
        : notInValues;

    return {
        negativeAttributeFilter: {
            displayForm: objRef,
            notIn: notInObject,
        },
    };
}

/**
 * Creates a new absolute date filter.
 *
 * @param dateDataSet - ref or identifier of the date data set to filter on
 * @param from - start of the interval in ISO-8601 calendar date format
 * @param to - end of the interval in ISO-8601 calendar date format
 * @public
 */
export function newAbsoluteDateFilter(
    dateDataSet: ObjRef | Identifier,
    from: string,
    to: string,
): IAbsoluteDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        absoluteDateFilter: {
            dataSet,
            from,
            to,
        },
    };
}

/**
 * Creates a new relative date filter.
 *
 * @param dateDataSet - ref or identifier of the date data set to filter on
 * @param granularity - granularity of the filters (month, year, etc.)
 * @param from - start of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @param to - end of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 *
 * See also {@link DateAttributeGranularity} and {@link DateGranularity}
 * @public
 */
export function newRelativeDateFilter(
    dateDataSet: ObjRef | Identifier,
    granularity: DateAttributeGranularity,
    from: number,
    to: number,
): IRelativeDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        relativeDateFilter: {
            dataSet,
            granularity,
            from,
            to,
        },
    };
}

/**
 * Creates a new all time date filter. This filter is used to indicate that there should be no filtering on the given date data set.
 *
 * @param dateDataSet - ref or identifier of the date data set to filter on
 * @public
 */
export function newAllTimeFilter(dateDataSet: ObjRef | Identifier): IRelativeDateFilter {
    const dataSet = isObjRef(dateDataSet) ? dateDataSet : idRef(dateDataSet);
    return {
        relativeDateFilter: {
            dataSet,
            granularity: "ALL_TIME_GRANULARITY",
            from: 0,
            to: 0,
        },
    };
}

function convertMeasureOrRefToObjRefInScope(measureOrRef: IMeasure | ObjRefInScope | string): ObjRefInScope {
    return isMeasure(measureOrRef)
        ? localIdRef(measureLocalId(measureOrRef))
        : typeof measureOrRef === "string"
        ? localIdRef(measureOrRef)
        : measureOrRef;
}

function convertAttributeOrRefToObjRefInScope(
    attributeOrRef: IAttribute | ObjRefInScope | string,
): ObjRefInScope {
    return isAttribute(attributeOrRef)
        ? localIdRef(attributeLocalId(attributeOrRef))
        : typeof attributeOrRef === "string"
        ? localIdRef(attributeOrRef)
        : attributeOrRef;
}

/**
 * Creates a new measure value filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - comparison or range operator to use in the filter
 * @param value - the value to compare to
 * @param treatNullValuesAs - value to use instead of null values
 * @public
 */
export function newMeasureValueFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    operator: ComparisonConditionOperator,
    value: number,
    treatNullValuesAs?: number,
): IMeasureValueFilter;

/**
 * Creates a new measure value filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - range operator to use in the filter
 * @param from - the start of the range
 * @param to - the end of the range
 * @param treatNullValuesAs - value to use instead of null values
 * @public
 */
export function newMeasureValueFilter(
    measureOrRef: IMeasure | ObjRefInScope | LocalIdRef | string,
    operator: RangeConditionOperator,
    from: number,
    to: number,
    treatNullValuesAs?: number,
): IMeasureValueFilter;

/**
 * Creates a new measure value filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - comparison or range operator to use in the filter
 * @param val1 - first numeric value, used as value in comparison or as 'from' value in range operators
 * @param val2OrTreatNullValuesAsInComparison - second numeric value, required in range operators and used in 'to' value; optional in comparison operators used as 'treatNullValuesAs' value
 * @param treatNullValuesAsInRange - third numeric value, optional in range operators and used as 'treatNullValuesAs' value; optional and ignored in comparison operators
 * @public
 */
export function newMeasureValueFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    operator: ComparisonConditionOperator | RangeConditionOperator,
    val1: number,
    val2OrTreatNullValuesAsInComparison?: number,
    treatNullValuesAsInRange?: number,
): IMeasureValueFilter {
    const ref = convertMeasureOrRefToObjRefInScope(measureOrRef);

    if (operator === "BETWEEN" || operator === "NOT_BETWEEN") {
        invariant(
            val2OrTreatNullValuesAsInComparison !== undefined,
            "measure value filter with range operator requires two numeric values",
        );

        const nullValuesProp = !isNil(treatNullValuesAsInRange)
            ? { treatNullValuesAs: treatNullValuesAsInRange }
            : {};

        return {
            measureValueFilter: {
                measure: ref,
                condition: {
                    range: {
                        operator,
                        from: val1,
                        to: val2OrTreatNullValuesAsInComparison!,
                        ...nullValuesProp,
                    },
                },
            },
        };
    } else {
        const nullValuesProp = !isNil(val2OrTreatNullValuesAsInComparison)
            ? { treatNullValuesAs: val2OrTreatNullValuesAsInComparison }
            : {};

        return {
            measureValueFilter: {
                measure: ref,
                condition: {
                    comparison: {
                        operator,
                        value: val1,
                        ...nullValuesProp,
                    },
                },
            },
        };
    }
}

/**
 * Creates a new ranking filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - TOP or BOTTOM operator to use in the filter
 * @param value - Number of values to use in filter
 * @param attributesOrRefs - Array of attributes used in filter, or reference of the attribute object. If instance of attribute is
 *   provided, then it is assumed this attribute is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @public
 */
export function newRankingFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    attributesOrRefs: Array<IAttribute | ObjRefInScope | string>,
    operator: RankingFilterOperator,
    value: number,
): IRankingFilter;

/**
 * Creates a new ranking filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param operator - TOP or BOTTOM operator to use in the filter
 * @param value - Number of values to use in filter
 * @public
 */
export function newRankingFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    operator: RankingFilterOperator,
    value: number,
): IRankingFilter;

/**
 * Creates a new ranking filter.
 *
 * @param measureOrRef - instance of measure to filter, or reference of the measure object; if instance of measure is
 *   provided, then it is assumed this measure is in scope of execution and will be referenced by the filter by
 *   its local identifier
 * @param attributesOrRefsOrOperator - Array of attributes used in filter, or reference of the attribute object. If instance of attribute is
 *   provided, then it is assumed this attribute is in scope of execution and will be referenced by the filter by
 *   its local identifier. If attributes are not specified it's TOP or BOTTOM operator to use in the filter
 * @param operatorOrValue - Number of values to use in filter or operator if attributes are not speciied
 * @param valueOrNothing - Value or nothing if attributes are not specified
 * @public
 */
export function newRankingFilter(
    measureOrRef: IMeasure | ObjRefInScope | string,
    attributesOrRefsOrOperator: Array<IAttribute | ObjRefInScope | string> | RankingFilterOperator,
    operatorOrValue: RankingFilterOperator | number,
    valueOrNothing?: number,
): IRankingFilter {
    if (typeof attributesOrRefsOrOperator === "string" && typeof operatorOrValue === "number") {
        const measureRef = convertMeasureOrRefToObjRefInScope(measureOrRef);
        return {
            rankingFilter: {
                measure: measureRef,
                operator: attributesOrRefsOrOperator,
                value: operatorOrValue,
            },
        };
    } else if (typeof operatorOrValue === "string" && valueOrNothing) {
        const measureRef = convertMeasureOrRefToObjRefInScope(measureOrRef);
        const attributeRefs = (attributesOrRefsOrOperator as Array<IAttribute | ObjRefInScope | string>).map(
            convertAttributeOrRefToObjRefInScope,
        );
        const attributesProp = attributeRefs.length ? { attributes: attributeRefs } : {};
        return {
            rankingFilter: {
                measure: measureRef,
                operator: operatorOrValue,
                value: valueOrNothing,
                ...attributesProp,
            },
        };
    }

    throw new Error("Ranking filter requires measure, operator and value");
}

type FilterOperator =
    | "IN"
    | "NOT_IN"
    | "IN_RELATIVE_DATE_RANGE"
    | "IN_ABSOLUTE_DATE_RANGE"
    | ComparisonConditionOperator
    | RangeConditionOperator
    | RankingFilterOperator;

/* eslint-disable prefer-spread */

function newFilter(
    operator: "IN",
    attributeOrRef: IAttribute | ObjRef | Identifier,
    inValues: IAttributeElements | string[],
): IPositiveAttributeFilter;
function newFilter(
    operator: "NOT_IN",
    attributeOrRef: IAttribute | ObjRef | Identifier,
    notInValues: IAttributeElements | string[],
): INegativeAttributeFilter;
function newFilter(
    operator: "IN_RELATIVE_DATE_RANGE",
    dateDataSet: ObjRef | Identifier,
    granularity: DateAttributeGranularity,
    from: number,
    to: number,
): IRelativeDateFilter;
function newFilter(
    operator: "IN_ABSOLUTE_DATE_RANGE",
    dateDataSet: ObjRef | Identifier,
    from: string,
    to: string,
): IAbsoluteDateFilter;
function newFilter(
    operator: ComparisonConditionOperator,
    measureOrRef: IMeasure | ObjRefInScope | string,
    value: number,
    treatNullValuesAs?: number,
): IMeasureValueFilter;
function newFilter(
    operator: RangeConditionOperator,
    measureOrRef: IMeasure | ObjRefInScope | LocalIdRef | string,
    from: number,
    to: number,
    treatNullValuesAs?: number,
): IMeasureValueFilter;
function newFilter(
    operator: RankingFilterOperator,
    measureOrRef: IMeasure | ObjRefInScope | string,
    attributesOrRefs: Array<IAttribute | ObjRefInScope | string>,
    value: number,
): IRankingFilter;
function newFilter(
    operator: RankingFilterOperator,
    measureOrRef: IMeasure | ObjRefInScope | string,
    value: number,
): IRankingFilter;

function newFilter(operator: FilterOperator, ...values: any[]): IFilter {
    switch (operator) {
        case "IN":
            return newPositiveAttributeFilter.apply(null, values as any);
        case "NOT_IN":
            return newNegativeAttributeFilter.apply(null, values as any);
        case "IN_RELATIVE_DATE_RANGE":
            return newRelativeDateFilter.apply(null, values as any);
        case "IN_ABSOLUTE_DATE_RANGE":
            return newAbsoluteDateFilter.apply(null, values as any);
        case "EQUAL_TO":
        case "NOT_EQUAL_TO":
        case "GREATER_THAN":
        case "GREATER_THAN_OR_EQUAL_TO":
        case "LESS_THAN":
        case "LESS_THAN_OR_EQUAL_TO":
            return newMeasureValueFilter(values[0], operator, values[1], values[2]);
        case "BETWEEN":
        case "NOT_BETWEEN":
            return newMeasureValueFilter(values[0], operator, values[1], values[2], values[3]);
        case "TOP":
        case "BOTTOM":
            return values.length === 2
                ? newRankingFilter(values[0], operator, values[1])
                : newRankingFilter(values[0], values[1], operator, values[2]);

        default:
            throw new Error(`Unsupported filter operator ${operator}`);
    }
}

const x = newFilter("IN", "attr", []);
const y = newFilter("BETWEEN", "attr", 5, 50, 100);
const z = newFilter("TOP", { identifier: "measure" }, 5);

//
//
//

type PositiveFilterTuple = [
    operator: "IN",
    attributeOrRef: IAttribute | ObjRef | Identifier,
    inValues: IAttributeElements | string[],
];
type NegativeFilterTuple = [
    operator: "NOT_IN",
    attributeOrRef: IAttribute | ObjRef | Identifier,
    notInValues: IAttributeElements | string[],
];

type RelativeDateFilterTuple = [
    operator: "IN_RELATIVE_DATE_RANGE",
    dateDataSet: ObjRef | Identifier,
    granularity: DateAttributeGranularity,
    from: number,
    to: number,
];
type AbsoluteDateFilterTuple = [
    operator: "IN_ABSOLUTE_DATE_RANGE",
    dateDataSet: ObjRef | Identifier,
    from: string,
    to: string,
];

type FilterTuple =
    | PositiveFilterTuple
    | NegativeFilterTuple
    | RelativeDateFilterTuple
    | AbsoluteDateFilterTuple;

function newFilter2(...args: PositiveFilterTuple): IPositiveAttributeFilter;
function newFilter2(...args: NegativeFilterTuple): INegativeAttributeFilter;
function newFilter2(...args: RelativeDateFilterTuple): IRelativeDateFilter;
function newFilter2(...args: AbsoluteDateFilterTuple): IAbsoluteDateFilter;
function newFilter2(...args: FilterTuple): IFilter {
    const [operator] = args;
    switch (operator) {
        case "IN": {
            const [, ...params] = args as PositiveFilterTuple;
            return newPositiveAttributeFilter(...params);
        }
        case "NOT_IN": {
            const [, ...params] = args as NegativeFilterTuple;
            return newNegativeAttributeFilter(...params);
        }
        case "IN_RELATIVE_DATE_RANGE": {
            const [, ...params] = args as RelativeDateFilterTuple;
            return newRelativeDateFilter(...params);
        }
        case "IN_ABSOLUTE_DATE_RANGE": {
            const [, ...params] = args as AbsoluteDateFilterTuple;
            return newAbsoluteDateFilter(...params);
        }
    }
}

const a = newFilter2("IN_RELATIVE_DATE_RANGE", "data", "GDC.time.date", 5, 6);
