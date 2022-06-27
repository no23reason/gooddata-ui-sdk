// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
export interface IAttributeFilterErrorProps {
    message?: string;
}

export const AttributeFilterError: React.VFC<IAttributeFilterErrorProps> = (
    _props: IAttributeFilterErrorProps,
) => {
    return (
        <div className="gd-message error s-button-error">
            <FormattedMessage id="gs.filter.error" />
        </div>
    );
};
