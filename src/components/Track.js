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
import ToggleButton from '@material-ui/lab/ToggleButton';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const toneKeys = [
    "KeyA", "KeyW", "KeyS", "KeyE", "KeyD", "KeyF", "KeyT", "KeyG", "KeyY", "KeyH", "KeyU", "KeyJ", "KeyK", "KeyO", "KeyL", "KeyP"
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
            armed: this.props.getArmArrayIndex(),
            visualNoteHeight: 8.75,
        };

        this.volumeChange = this.volumeChange.bind(this);
        this.panChange = this.panChange.bind(this);
        this.clearTrack = this.clearTrack.bind(this);
        this.findFirstNonNullIndex = this.findFirstNonNullIndex.bind(this);


        this.redBarRef = React.createRef();
        this.noteRef = React.createRef();

        this.activeOctaves = [4]; //4 is our base octave so it'll always be in here even if no notes are present
        this.currentVisualNoteRefs = [];
        this.activeNotes = [null, null, null, null, null, null, null, null, null, null]; //10 possible active notes
        this.visualNotesData = []; //This will be used to store the 4 values needed to load a visualNote from memory, has to be separate since...
        //These values are only obtainable the moment before the visualNote ref is cleared, as the VisualNotes in visualNotes are not accessible to us...
        //Without having a ref to it, and we can only have 10 at a time

        let i = 0;
        for (; i != 10; i++) {
            this.currentVisualNoteRefs[i] = React.createRef();
        }

        this.trackSaveData = null;
    }

    volumeChange = (event, newValue) => {
        this.setState({
            volume: newValue
        });
    }

    panChange = (newValue) => {
        this.props.changePan(newValue);

        this.setState({
            pan: newValue
        })
    }

    trackLengthChange = (newValue) => {
        this.setState({
            trackLength: newValue
        });
    }

    getStartTime = () => {
        return this.state.timeStart;
    }

    getTrackLength = () => {
        return this.state.trackLength;
    }

    addVisualNote = (index, xValue, yValue) => {
        this.setState({
            visualNotes: [...this.state.visualNotes, <VisualNote isExpandingByDefault={true} width={1} xValue={xValue} yValue={yValue} ref={this.currentVisualNoteRefs[index]} height={this.state.visualNoteHeight} trackStartTimestamp={this.getStartTime} trackLength={this.getTrackLength}/>],
        })
    }

    clearTrack = () => {
        this.props.clearTrackCallback();

        this.setState({
            pan: 0.5,
            volume: 100,
            timelineAnimation: 'stop',
            visualNotes: [],
        });

        this.redBarRef.current.style.animationPlayState = 'initial';
        this.activeOctaves = [4];

        let i = 0;
        for (; i != 10; i++) {
            this.currentVisualNoteRefs[i] = React.createRef();
        }
    }

    componentDidUpdate(prevProps) { //All this code was just a nightmare, comments would do more harm than good at this point
        if ((this.props.isSavingToJSON != prevProps.isSavingToJSON) && this.props.isSavingToJSON == true) {
            this.saveTrackToJSON();
        }
        
        if ((this.props.isLoadingFromJSON != prevProps.isLoadingFromJSON) && this.props.isLoadingFromJSON == true) {
            this.loadTrackFromJSON();
            console.log(this.state)
        }

        if (this.props.playTimelineState != prevProps.playTimelineState) {
            if (this.props.playTimelineState === 'pause') {
                this.redBarRef.current.style.animationPlayState = 'paused';
                //console.log(this.state.visualNotes);
            } else if (this.props.playTimelineState === 'play' || this.props.playTimelineState === 'record') {
                this.redBarRef.current.style.animationDuration = this.props.getTrackLength() + 'ms';
                this.trackLengthChange(this.props.getTrackLength());
                this.redBarRef.current.style.animationPlayState = 'inherit';

                if (this.props.playTimelineState === 'record') {
                    this.setState({ timeStart: performance.now() });
                }
            }

            this.setState({
                timelineAnimation: this.props.playTimelineState
            });
        }

        if (this.props.keyPressEvent != prevProps.keyPressEvent && toneKeys.indexOf(this.props.keyPressEvent[0]) != -1 && this.state.armed) {
            if (this.props.keyPressEvent[1] == 'down' && this.activeNotes.indexOf(this.props.keyPressEvent[0]) == -1) {
                if (this.activeOctaves.indexOf(this.props.composerOctave) == -1) {
                    this.activeOctaves = [...this.activeOctaves, this.props.composerOctave]
                }

                this.addVisualNote(
                    this.findFirstNonNullIndex(this.activeNotes),
                    (((performance.now() - this.state.timeStart) / this.state.trackLength) * 1050) + 7,
                    (toneKeys.length - (toneKeys.indexOf(this.props.keyPressEvent[0]) + 1)) * (140 / toneKeys.length)
                );

                this.activeNotes[this.findFirstNonNullIndex(this.activeNotes)] = this.props.keyPressEvent[0];
            } else if (this.props.keyPressEvent[1] == 'up') {
                if (this.currentVisualNoteRefs[this.activeNotes.indexOf(this.props.keyPressEvent[0])]) {
                    if (this.currentVisualNoteRefs[this.activeNotes.indexOf(this.props.keyPressEvent[0])].current) {
                        this.currentVisualNoteRefs[this.activeNotes.indexOf(this.props.keyPressEvent[0])].current.setIsExpanding(false);

                        this.visualNotesData.push(this.currentVisualNoteRefs[this.activeNotes.indexOf(this.props.keyPressEvent[0])].current.saveVisualNoteAsJSON());

                        this.currentVisualNoteRefs[this.activeNotes.indexOf(this.props.keyPressEvent[0])] = React.createRef();
                    } else if (this.currentVisualNoteRefs[this.activeNotes.indexOf(prevProps.keyPressEvent[0])].current) {
                        this.currentVisualNoteRefs[this.activeNotes.indexOf(prevProps.keyPressEvent[0])].current.setIsExpanding(false);

                        this.visualNotesData.push(this.currentVisualNoteRefs[this.activeNotes.indexOf(prevProps.keyPressEvent[0])].current.saveVisualNoteAsJSON());

                        this.currentVisualNoteRefs[this.activeNotes.indexOf(prevProps.keyPressEvent[0])] = React.createRef();
                    }
                }

                this.activeNotes[this.activeNotes.indexOf(this.props.keyPressEvent[0])] = null;
            }
        }
    }

    componentWillUnmount() {
        this.setState({
            timelineAnimation: 'stop',
        })
    }


    findFirstNonNullIndex = (array) => {
        let i = 0;
        for (; i != 10; i++) {
            if (array[i] == null) {
                return i;
            }
        }

        return 0;
    }

    saveTrackToJSON() {
        let trackSaveFile = {
            visualNotes: this.visualNotesData,
            pan: this.state.pan,
            volume: this.state.volume, 
            trackLength: this.state.trackLength,
            armed: this.state.armed,
            visualNoteHeight: this.state.visualNoteHeight, //This value is determined by the range of octaves in use
        }

        //console.log(JSON.stringify(trackSaveFile));
        this.trackSaveData = JSON.stringify(trackSaveFile);
    }

    loadTrackFromJSON = () => {
        if (this.trackSaveData.length == 0) {
            console.log('Failed to load data for this track');
        }

        let trackData = JSON.parse(this.trackSaveData);

        if (typeof(trackData.visualNotes) != "undefined") {
            let i = 0;
            let temp = [];
            for (; i != trackData.visualNotes.length; i++) {
                temp.push(<VisualNote isExpandingByDefault={false} width={trackData.visualNotes[i].width} height={trackData.visualNotes[i].height} xValue={trackData.visualNotes[i].xValue} yValue={trackData.visualNotes[i].yValue}/>);
            }

            this.setState({
                visualNotes: temp
            })
        }

    }

    render() {
        const { classes, setPlayTimelineState, toggleMuteArray, getTrackLength, getArmArrayIndex, toggleArmArray } = this.props;
        let armValue = false;

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
                        <FormGroup row style={{height: 50}}>
                            <FormControlLabel control={<Checkbox name="muteCheckbox" size="small" />} label="Mute" onChange={(e) => { toggleMuteArray(); }} />
                            <FormControlLabel control={<Checkbox name="soloCheckbox" size="small" />} label="Solo" checked={false} />
                        </FormGroup>

                        <FormGroup column>
                            <ToggleButton size="small" style={{marginRight: 10,}} selected={this.state.armed} onChange={() => {this.setState({armed: !this.state.armed})}} aria-label="armed">
                                <FiberManualRecordIcon/>
                            </ToggleButton>
                            <Button onClick={this.clearTrack}>Clear</Button>
                        </FormGroup>
                    </div>

                    <div className={classes.sliders}>
                        <Grid container spacing={1}>
                            <Grid item xs={2}>
                                <VolumeDown fontSize={'small'} />
                            </Grid>

                            <Grid item xs={8}>
                                <Slider onChange={this.volumeChange} defaultValue={100} min={0} max={200} style={{ width: 85 }}>

                                </Slider>
                            </Grid>

                            <Grid item xs={2}>
                                <VolumeUp fontSize={'small'} />
                            </Grid>
                        </Grid>

                        <Grid container spacing={1} style={{ position: 'relative', top: '-5px' }}>
                            <Grid item xs={2}>
                                <ChevronLeftIcon fontSize={'small'} />
                            </Grid>

                            <Grid item xs={8}>
                                <Slider onChange={(e, value) => {this.panChange(1 - value);}} defaultValue={0.5} min={0} max={1} step={0.05} style={{ width: 85 }}>

                                </Slider>
                            </Grid>

                            <Grid item xs={2}>
                                <ChevronRightIcon fontSize={'small'} />
                            </Grid>

                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(Track);