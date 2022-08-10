// (C) 2022 GoodData Corporation
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IKpiWidget, ObjRef, widgetRef } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { AttributeFilterConfiguration } from "../../common";
import { KpiComparison } from "./KpiComparison/KpiComparison";
import { KpiWidgetDateDatasetFilter } from "./KpiWidgetDateDatasetFilter";
import { KpiMetricDropdown } from "./KpiMetricDropdown/KpiMetricDropdown";
import { KpiConfigurationPanelHeader } from "./KpiConfigurationPanelHeader";
import { KpiConfigurationMessages } from "./KpiConfigurationMessages";
import { KpiDrillConfiguration } from "./KpiDrill/KpiDrillConfiguration";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef";
import { QueryWidgetAlertCount, queryWidgetAlertCount, useDashboardQueryProcessing } from "../../../../model";

interface IKpiConfigurationPanelCoreProps {
    widget?: IKpiWidget;
    onMeasureChange: (item: ObjRef) => void;
    onClose: () => void;
}

export const KpiConfigurationPanelCore: React.FC<IKpiConfigurationPanelCoreProps> = (props) => {
    const { widget, onMeasureChange, onClose } = props;

    const ref = widget && widgetRef(widget);
    const metric = widget?.kpi.metric;

    const {
        run: runAlertNumberQuery,
        result: numberOfAlerts,
        status,
    } = useDashboardQueryProcessing<QueryWidgetAlertCount, number, Parameters<typeof queryWidgetAlertCount>>({
        queryCreator: queryWidgetAlertCount,
    });

    useEffect(() => {
        if (ref) {
            runAlertNumberQuery(ref);
        }
    }, [safeSerializeObjRef(ref)]);

    const isNumOfAlertsLoaded = status === "success";

    const configurationCategoryClasses = cx("configuration-category", {
        "s-widget-alerts-information-loaded": isNumOfAlertsLoaded,
    });

    const sectionHeaderClasses = cx({ "is-disabled": !metric });

    return (
        <>
            <KpiConfigurationPanelHeader onCloseButtonClick={onClose} />
            <div className="configuration-panel">
                <div className={configurationCategoryClasses}>
                    <KpiConfigurationMessages numberOfAlerts={numberOfAlerts} />

                    <Typography tagName="h3">
                        <FormattedMessage id="configurationPanel.measure" />
                    </Typography>
                    <KpiMetricDropdown widget={widget} onMeasureChange={onMeasureChange} />

                    <Typography tagName="h3" className={sectionHeaderClasses}>
                        <FormattedMessage id="configurationPanel.filterBy" />
                    </Typography>
                    {!!widget && (
                        <>
                            <KpiWidgetDateDatasetFilter widget={widget} />
                            <AttributeFilterConfiguration widget={widget} />
                        </>
                    )}

                    <Typography tagName="h3" className={sectionHeaderClasses}>
                        <FormattedMessage id="configurationPanel.comparison" />
                    </Typography>
                    {!!widget && <KpiComparison widget={widget} />}

                    <Typography tagName="h3" className={sectionHeaderClasses}>
                        <FormattedMessage id="configurationPanel.drillIntoDashboard" />
                    </Typography>
                    {!!widget && <KpiDrillConfiguration widget={widget} />}
                </div>
            </div>
        </>
    );
};
