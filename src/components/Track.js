import React, { createContext, useEffect, useRef } from 'react'
import { makeStyles, withStyles, createStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'
import clsx from 'clsx';
import VisualNote from './VisualNote'
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Grid from '@material-ui/core/Grid'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { ThreeSixtyOutlined } from '@material-ui/icons';

const toneKeys = [
    "KeyA","KeyW","KeyS","KeyE","KeyD","KeyF","KeyT","KeyG","KeyY","KeyH","KeyU","KeyJ","KeyK","KeyO","KeyL","KeyP"
];

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
        display: 'flex',
        flexDirection: 'row',
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
        height: 140,
        width: 7,
        backgroundColor: 'red',
    },
    redBarAnimation: {
        animation: "$moveLine 10000ms linear",
    },
});

class Track extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pan: 0.5,
            volume: 100,
            timelineAnimation: 'stop',
            trackLength: 8000,
            timeStart: null,
            visualNotes: [],
        };

        this.volumeChange = this.volumeChange.bind(this);
        this.panChange = this.panChange.bind(this);
        this.clearTrack = this.clearTrack.bind(this);
        this.addCurrentHeldKey = this.addCurrentHeldKey.bind(this);

        this.redBarRef = React.createRef();
        this.noteRef = React.createRef();
        //this.currentVisualNoteRef = React.createRef();

        this.activeOctaves = [];
        this.currentHeldKeys = [];
        this.currentVisualNoteRefs = [];
        let i = 0;
        for (; i != 5; i++) {
            this.currentVisualNoteRefs.push(React.createRef());
        }

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

    trackLengthChange = (newValue) => {
        this.setState({
            trackLength: newValue
        });
    }

    addVisualNote = (index, xValue, yValue) => {
        this.setState({
            visualNotes: [...this.state.visualNotes, <VisualNote xValue={xValue} yValue={yValue} ref={this.currentVisualNoteRefs[index]}/>],
        })

        if (this.activeOctaves.indexOf(this.state.composerOctave) != -1) {
            this.activeOctaves = [...this.state.activeOctaves, this.state.composerOctave];
        }
    }

    addCurrentHeldKey = (value) => {
        this.currentHeldKeys = [...this.currentHeldKeys, value];
        console.log(this.currentHeldKeys);
        //console.log(this.state.currentHeldKeys)
    }

    removeCurrentHeldKey = (index) => {
        this.currentHeldKeys.splice(index, 1);
    }

    clearTrack = () => {
        this.props.clearTrackCallback();

        this.setState({
            pan: 0.5,
            volume: 100,
            timelineAnimation: 'stop',
            visualNotes: [],
            activeOctaves: [],
        });

        this.redBarRef.current.style.animationPlayState = 'initial';
        //this.currentVisualNoteRef = React.createRef();
        let i = 0;
        for (; i != 5; i++) {
            this.currentVisualNoteRefs[i] = React.createRef();
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.playTimelineState != this.props.playTimelineState) {
            if (nextProps.playTimelineState === 'pause') {
                this.redBarRef.current.style.animationPlayState = 'paused';
            } else if (nextProps.playTimelineState === 'play' || nextProps.playTimelineState === 'record') {
                this.redBarRef.current.style.animationDuration = nextProps.getTrackLength() + 'ms';
                this.trackLengthChange(nextProps.getTrackLength());
                this.redBarRef.current.style.animationPlayState = 'inherit';

                if (nextProps.playTimelineState === 'record') {
                    this.setState({timeStart: performance.now()});
                }
            }

            this.setState({
                timelineAnimation: nextProps.playTimelineState,
            });
        }

        if (nextProps.keyPressValue != this.props.keyPressValue || nextProps.keyPressState != this.props.keyPressState) {
            if (this.props.keyPressState === 'down' && nextProps.keyPressValue != this.props.keyPressValue) {
                if (this.currentHeldKeys.indexOf(nextProps.keyPressValue) === -1) {
                    this.addCurrentHeldKey(nextProps.keyPressValue);
                    console.log(this.state);
                }

                this.addVisualNote(this.currentHeldKeys.indexOf(nextProps.keyPressValue), (((performance.now() - this.state.timeStart) / this.state.trackLength) * 1050) + 7, (toneKeys.length - (toneKeys.indexOf(nextProps.keyPressValue) + 1)) * (140 / toneKeys.length));
            } else if (nextProps.keyPressState === 'up') {
                this.currentVisualNoteRefs[this.currentHeldKeys.indexOf(nextProps.keyPressValue)].current.toggleIsExpanding();


                if (this.currentHeldKeys.indexOf(nextProps.keyPressValue) != -1) {
                    this.removeCurrentHeldKey(this.currentHeldKeys.indexOf(nextProps.keyPressValue));
                }
            }
        }

        if (nextProps.keyPressState === 'up' && this.props.keyPressState === 'up' && this.currentHeldKeys.indexOf(nextProps.keyPressValue) != -1) {
            console.log(this.currentHeldKeys + " Current: " + this.props.keyPressValue + " Next: " + nextProps.keyPressValue);
            this.currentVisualNoteRefs[this.currentHeldKeys.indexOf(nextProps.keyPressValue)].current.toggleIsExpanding();

            if (this.currentHeldKeys.indexOf(nextProps.keyPressValue) != -1) {
                this.removeCurrentHeldKey(this.currentHeldKeys.indexOf(nextProps.keyPressValue));
            }
        }
        
    }

    componentWillUnmount() {
        this.setState({
            timelineAnimation: 'stop',
        })
    }


    render() {
        const { classes, setPlayTimelineState, toggleMuteArray, getTrackLength } = this.props;

        //this.state.trackLength = getTrackLength();

        return (
            <div className={classes.root}>
                <div className={classes.trackVisual}>
                    <div className={classes.canvas} >
                        <div className={clsx(classes.redBar,
                            {
                                [classes.redBarAnimation]: this.state.timelineAnimation === 'play' || this.state.timelineAnimation === 'pause' || this.state.timelineAnimation === 'record',
                            }
                        )}
                            onAnimationEnd={() => setPlayTimelineState('stop')} ref={this.redBarRef}
                        >
                        </div>
                        {this.state.visualNotes}
                    </div>
                </div>

                <div className={classes.options}>
                    <div className={classes.toggles}>
                        <FormGroup row>
                            <FormControlLabel control={<Checkbox name="muteCheckbox" size="small" />} label="Mute" onChange={(e) => { toggleMuteArray(); }} />
                            <FormControlLabel control={<Checkbox name="soloCheckbox" size="small" />} label="Solo" checked={false} />
                        </FormGroup>

                        <FormGroup column>
                            <Button>Select</Button>
                            <Button onClick={this.clearTrack}>Clear</Button>
                        </FormGroup>
                    </div>

                    <div className={classes.sliders}>
                        <Grid container spacing={1}>
                            <Grid item xs={2}>
                                <VolumeDown fontSize={'small'}/>
                            </Grid>

                            <Grid item xs={8}>
                                <Slider onChange={this.volumeChange} defaultValue={100} min={0} max={200} style={{width: 85}}>

                                </Slider>
                            </Grid>

                            <Grid item xs={2}>
                                <VolumeUp fontSize={'small'}/>
                            </Grid>
                        </Grid>

                        <Grid container spacing={1} style={{position: 'relative', top: '-5px'}}>
                            <Grid item xs={2}>
                                <ChevronLeftIcon fontSize={'small'}/>
                            </Grid>

                            <Grid item xs={8}>
                                <Slider onChange={this.panChange} defaultValue={0.5} min={0} max={1} step={0.05} style={{width: 85}}>

                                </Slider>
                            </Grid>

                            <Grid item xs={2}>
                                <ChevronRightIcon fontSize={'small'}/>
                            </Grid>

                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

/*
class Track extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pan: 0.5,
            volume: 100,
            solo: false,
            mute: false,
            timelineAnimation: 'stop',
        };

        this.volumeChange = this.volumeChange.bind(this);
        this.panChange = this.panChange.bind(this);

        this.redBarRef = React.createRef();
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

    muteChange = (event) => {
        this.toggleMuteArray();
    }

    soloChange = (event) => {
        //this.toggleSoloArray();
    }

    timelineAnimationChange = (newValue) => {
        if (newValue === 'pause') {
            this.redBarRef.current.style.animationPlayState = 'paused';
        } else if (newValue === 'play') {
            this.redBarRef.current.style.animationPlayState = 'inherit';
        }

        this.setState({
            timelineAnimation: newValue,
        })
    }

    componentWillUnmount() {
        this.setState({
            timelineAnimation: 'stop',
        })
    }


    render() {
        const { classes, setPlayTimeline, toggleMuteArray } = this.props;

        return (
            <div className={classes.root}>
                <div className={classes.trackVisual}>
                    <div className={classes.canvas}>
                        <div className={clsx(classes.redBar,
                            {
                                [classes.redBarAnimation]: this.state.timelineAnimation === 'play' || this.state.timelineAnimation === 'pause',
                            }//How about if paused, set marginLeft to current animation marginLeft value
                        )}
                        onAnimationEnd={() => setPlayTimeline('stop')} ref={this.redBarRef}>

                        </div>
                    </div>
                </div>

                <div className={classes.options}>
                    <div className={classes.toggles}>
                        <FormGroup row>
                            <FormControlLabel control={<Checkbox name="muteCheckbox" size="small" />} label="Mute" checked={false} onChange={toggleMuteArray}/>
                            <FormControlLabel control={<Checkbox name="soloCheckbox" size="small" />} label="Solo" checked={false}/>
                        </FormGroup>

                        <Button>Select</Button>
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
*/

export default withStyles(useStyles, { withTheme: true })(Track);