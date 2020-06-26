// (C) 2020 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { string as stringUtils } from "@gooddata/js-utils";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import { ISeparators } from "@gooddata/sdk-ui";

import PreviewRows from "../shared/PreviewRows";
import { IFormatTemplate } from "../../typings";

interface ITemplateDropdownItemProps {
    template: IFormatTemplate;
    separators?: ISeparators;
    onClick: (template: IFormatTemplate) => void;
}

interface ITemplateDropdownItemState {
    displayHelp: boolean;
}

function templateDropdownItemId(template: IFormatTemplate): string {
    return `gd-format-preset-template-${template.localIdentifier}`;
}

export default class DropdownItem extends React.Component<
    ITemplateDropdownItemProps,
    ITemplateDropdownItemState
> {
    public state = {
        displayHelp: false,
    };

    public render() {
        const { template, separators } = this.props;
        const { displayHelp } = this.state;
        return (
            <>
                <div
                    id={templateDropdownItemId(template)}
                    className={`gd-list-item gd-format-preset gd-format-template s-measure-format-template-${stringUtils.simplifyText(
                        template.name,
                    )}`}
                    onClick={this.onClick}
                >
                    <span title={template.name} className="gd-format-preset-name gd-list-item-shortened">
                        {template.name}
                    </span>
                    <div
                        className="gd-format-template-help icon-circle-question s-measure-format-template-help-toggle-icon"
                        onMouseEnter={this.toggleHelp}
                        onMouseLeave={this.toggleHelp}
                    />
                </div>
                {displayHelp && (
                    <Bubble
                        alignTo={`#${templateDropdownItemId(template)}`}
                        className={`gd-measure-format-template-preview-bubble bubble-light s-measure-format-template-help-bubble-${stringUtils.simplifyText(
                            template.name,
                        )}`}
                        alignPoints={[{ align: "cr cl" }]}
                    >
                        <h3 className={"gd-measure-format-template-preview-bubble-title"}>{template.name}</h3>
                        <div
                            className={`gd-measure-format-template-preview-bubble-subtitle s-measure-format-template-help-preview-${stringUtils.simplifyText(
                                template.name,
                            )}`}
                        >
                            <FormattedMessage id="measureNumberCustomFormatDialog.template.preview.title" />
                        </div>
                        <PreviewRows
                            previewNumbers={[
                                -1234567.891,
                                -1234.567,
                                -1.234,
                                0,
                                1.234,
                                1234.567,
                                1234567.891,
                            ]}
                            format={template.format}
                            separators={separators}
                        />
                    </Bubble>
                )}
            </>
        );
    }

    private onClick = () => {
        this.props.onClick(this.props.template);
    };

    private toggleHelp = () => {
        this.setState((state) => ({ displayHelp: !state.displayHelp }));
    };
}
