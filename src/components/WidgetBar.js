import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';


function TabPanel(props) {
    const { children, value, index } = props;

    return (
        <div>
            {value == index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function LinkTab(props) {
    return (
        <Tab
            component="a"
            onClick={(event) => {
                event.preventDefault();
            }}
            {...props}
        />
    );
}

const useStyles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: 'lightgray',
    },
    selectStyle: {
        marginLeft: 10,
    }
});

class WidgetBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            arpeggiatorActive: false,
            arpeggiatorValue: 0.03125,
        };

    }


    //We want the Track tab to have track length, instrument select, ...

    handleTabChange = (event, newValue) => {
        this.setState({
            value: newValue,
        });
    }

    handleArpeggiatorChange = (event) => {
        this.props.arpeggiatorChangeCallback(event.target.value);

        this.setState({
            arpeggiatorValue: event.target.value
        })
    }

    handleArpeggiatorToggle = (event) => {
        this.props.arpeggiatorToggleCallback();

        this.setState({
            arpeggiatorActive: !this.arpeggiatorActive
        })
    }


    render() {
        const { classes, renderMP3Callback, composerSaveDataCallback, composerLoadDataCallback } = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs
                        variant="fullWidth"
                        value={this.state.value}
                        onChange={this.handleTabChange}
                    >
                        <LinkTab label="Instruments" />
                        <LinkTab label="Arpeggiator" />
                        <LinkTab label="Help" />
                        <LinkTab label="Save/Load" />
                    </Tabs>
                </AppBar>

                <TabPanel value={this.state.value} index={0}>
                    Track 1 Instrument:
                    <Select native defaultValue="wobbly" className={classes.selectStyle}>
                        <option value="" />
                        <optgroup label="Synths">
                            <option value={1}>Wobbly</option>
                            <option value={2}>Something else</option>
                        </optgroup>
                        <optgroup label="Drum Kits">
                            <option value={3}>Drum Kit 1</option>
                            <option value={4}>Drum Kit 2</option>
                        </optgroup>
                    </Select><br />
                    Track 2 Instrument:
                    <Select native defaultValue="wobbly" className={classes.selectStyle}>
                        <option value="" />
                        <optgroup label="Synths">
                            <option value={1}>Wobbly</option>
                            <option value={2}>Something else</option>
                        </optgroup>
                        <optgroup label="Drum Kits">
                            <option value={3}>Drum Kit 1</option>
                            <option value={4}>Drum Kit 2</option>
                        </optgroup>
                    </Select><br />
                    Track 3 Instrument:
                    <Select native defaultValue="wobbly" className={classes.selectStyle}>
                        <option value="" />
                        <optgroup label="Synths">
                            <option value={1}>Wobbly</option>
                            <option value={2}>Something else</option>
                        </optgroup>
                        <optgroup label="Drum Kits">
                            <option value={3}>Drum Kit 1</option>
                            <option value={4}>Drum Kit 2</option>
                        </optgroup>
                    </Select><br />
                    Track 4 Instrument:
                    <Select native defaultValue="wobbly" className={classes.selectStyle}>
                        <option value="" />
                        <optgroup label="Synths">
                            <option value={1}>Wobbly</option>
                            <option value={2}>Something else</option>
                        </optgroup>
                        <optgroup label="Drum Kits">
                            <option value={3}>Drum Kit 1</option>
                            <option value={4}>Drum Kit 2</option>
                        </optgroup>
                    </Select><br />
                </TabPanel>

                <TabPanel value={this.state.value} index={1}>
                    Arpeggiator Toggle: <t/>
                    <Checkbox onChange={this.handleArpeggiatorToggle}></Checkbox>
                    <br/>

                    Arpeggiator Speed: <t/>
                    <select id="arpSpeeds" onChange={this.handleArpeggiatorChange}>
                        <option value="0.03125">1/1</option>
                        <option value="0.06250">1/2</option>
                        <option value="0.125">1/4</option>
                        <option value="0.250">1/8</option>
                        <option value="0.5">1/16</option>
                        <option value="1">1/32</option>
                    </select>
                </TabPanel>

                <TabPanel value={this.state.value} index={2}>
                    Note Inputs: A, W, S, E, D, F, T, G, Y, H, U, J, K, O, L, P<br />
                    Change Octaves: Z (down), X (up)
                </TabPanel>

                <TabPanel value={this.state.value} index={3}>
                    <Button onClick={renderMP3Callback}>Render MP3</Button>
                    <Button onClick={composerSaveDataCallback}>Save composer to JSON</Button>
                    <Button onClick={composerLoadDataCallback}>Load composer from JSON</Button>
                </TabPanel>

            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(WidgetBar);