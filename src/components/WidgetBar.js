import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

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

    handleTabChange = (event, newValue) => {
        this.setState({
            value: newValue,
        });
    }


    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs
                        variant="fullWidth"
                        value={this.state.value}
                        onChange={this.handleTabChange}
                    >
                        <LinkTab label="Track Info"/>
                        <LinkTab label="Arpeggiator"/>
                        <LinkTab label="Help"/>
                    </Tabs>
                </AppBar>

                <TabPanel value={this.state.value} index={0}>
                    Page One
                </TabPanel>

                <TabPanel value={this.state.value} index={1}>
                    Page Two
                </TabPanel>

                <TabPanel value={this.state.value} index={2}>
                    Note Inputs: A, W, S, E, D, F, T, G, Y, H, U, J, K, O, L, P<br/>
                    Change Octaves: Z (down), X (up)
                </TabPanel>


            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true})(WidgetBar);