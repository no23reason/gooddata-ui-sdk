// (C) 2019 GoodData Corporation
const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });

// TODO RAIL-2870 revisit after custom renderer is available in DashboardView
// mock canvas for dashboard rendering purposes
HTMLCanvasElement.prototype.getContext = () => {
    // return whatever getContext has to return
};
