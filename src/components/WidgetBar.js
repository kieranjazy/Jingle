import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'

function TabPanel(props) {
    const { children, value, index} = props;

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
    }
});

class WidgetBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
        };

    }


    //We want the Track tab to have track length, instrument select, ...

    handleTabChange = (event, newValue) => {
        this.setState({
            value: newValue,
        });
    }


    render() {
        const { classes, renderMP3Callback } = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs
                        variant="fullWidth"
                        value={this.state.value}
                        onChange={this.handleTabChange}
                    >
                        <LinkTab label="Instruments"/>
                        <LinkTab label="Arpeggiator"/>
                        <LinkTab label="Help"/>
                        <LinkTab label="Save/Load"/>
                    </Tabs>
                </AppBar>

                <TabPanel value={this.state.value} index={0}>
                    Track 1 Instrument: <br/>
                    Track 2 Instrument: <br/>
                    Track 3 Instrument: <br/>
                    Track 4 Instrument: <br/>
                </TabPanel>

                <TabPanel value={this.state.value} index={1}>
                    Page Two
                </TabPanel>

                <TabPanel value={this.state.value} index={2}>
                    Note Inputs: A, W, S, E, D, F, T, G, Y, H, U, J, K, O, L, P<br/>
                    Change Octaves: Z (down), X (up)
                </TabPanel>

                <TabPanel value={this.state.value} index={3}>
                    <Button onClick={renderMP3Callback}>Render MP3</Button>
                </TabPanel>

            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true})(WidgetBar);