import React, { createContext, useEffect } from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'
import clsx from 'clsx';

const useStyles = theme => ({
    root: {
        position: 'relative',
        border: 2,
        borderStyle: 'solid',
        borderColor: '#088FCC',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'row',
        margin: 5,
    },
    "@keyframes moveLine": {
        "0%": {
            marginLeft: 0,
        },
        "100%": {
            marginLeft: 1050,
        }
    },
    trackVisual: {
        backgroundColor: '#1eddb1',
        textAlign: 'center',
        paddingRight: 350,
        paddingLeft: 700,
        paddingTop: 70,
        paddingBottom: 70,
        fontFamily: 'Roboto',
        fontSize: 30,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
    },
    canvas: {
        height: 140,
        width: 1050,
        position: 'absolute',
        background: 'lightgray',
        top: 0,
        left: 0,
    },
    options: {
        textAlign: 'center',
        backgroundColor: '#c7594b',
        paddingTop: 12,
        fontFamily: 'Roboto',
        fontSize: 20,
        paddingLeft: 10,
        paddingRight: 100,
        overflow: 'hidden',
    },
    toggles: {

    },
    sliders: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        width: 120,
        height: 10,
        position: 'relative',
    },
    redBar: {
        top: 0,
        left: 0,
        marginLeft: 0,
        height: 140,
        width: 7,
        backgroundColor: 'red',
    },
    redBarAnimation: {
        animation: "$moveLine 10000ms linear",
    }
});

class Track extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pan: 0.5,
            volume: 100,
            solo: false,
            mute: false,
            timelineAnimation: false,
        };

        this.volumeChange = this.volumeChange.bind(this);
        this.panChange = this.panChange.bind(this);
    }

    volumeChange = (event, newValue) => {
        this.setState({
            volume: newValue
        });
    }

    panChange = (event, newValue) => {
        this.setState({
            pan: newValue
        })
    }

    timelineAnimationChange = (newValue) => {
        this.setState({
            timelineAnimation: newValue
        })
    }


    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <div className={classes.trackVisual}>
                    <div className={classes.canvas}>
                        <div className={clsx(classes.redBar, { [classes.redBarAnimation]: this.state.timelineAnimation })} onAnimationEnd={() => this.state.timelineAnimation = 0}>

                        </div>
                    </div>
                </div>

                <div className={classes.options}>
                    <div className={classes.toggles}>
                        <FormGroup row>
                            <FormControlLabel control={<Checkbox name="muteCheckbox" size="small" />} label="Mute" />
                            <FormControlLabel control={<Checkbox name="soloCheckbox" size="small" />} label="Solo" />
                        </FormGroup>

                        <Button onClick={() => this.state.timelineAnimation = 1}>Test</Button>
                    </div>

                    <div className={classes.sliders}>
                        <Slider onChange={this.volumeChange} defaultValue={100} min={0} max={200}>

                        </Slider>

                        <Slider onChange={this.panChange} defaultValue={0.5} min={0} max={1} step={0.05}>

                        </Slider>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(Track);