import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import TextField from '@material-ui/core/TextField'
import Track from './Track'
import Composer from './Composer'
import WidgetBar from './WidgetBar'
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const useStyles = theme => ({
    root: {
        //width: 600
        display: 'flex',
        flexDirection: 'column',
    },
    controlsDiv: {
        backgroundColor: "chocolate",
        fontFamily: "Roboto",
        display: 'flex',
        flexDirection: 'row',
    },
    trackDiv: {
        float: 'left',
        padding: 10,
        backgroundColor: '#538399',
    },
    masterVolumeSlider: {
        width: 200,
        marginLeft: 10,
        top: '10px',
    },
    BPM: {

    },
});

const keyBindings = [
    "KeyZ","KeyX",
];

const toneKeys = [
    "KeyA","KeyW","KeyS","KeyE","KeyD","KeyF","KeyT","KeyG","KeyY","KeyH","KeyU","KeyJ","KeyK","KeyO","KeyL","KeyP"
];

class TrackManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            masterVolume: 1,
            bpm: 120,
            muteArray: [0, 0, 0, 0],
            soloArray: [0, 0, 0, 0],
            playTimelineState: 'stop',
            octave: 4,
            keyPressEvent: ['noKey', 'noState']
        };

        this.composer = new Composer();

        this.composer.setMasterVolume(this.state.masterVolume);
        this.composer.setBpm(this.state.bpm);

        this.textFieldRef = React.createRef();
        this.rootDivRef = React.createRef();
    }

    getTrackLength = () => {
        return (1/(this.state.bpm / 60)) * 16000;
    }

    setPlayTimelineState = (newState) => {
        if (newState == this.state.playTimelineState)
            return;

        if (newState === 'record') {
            this.setState({playTimelineState: 'recordPre'})
            this.composer.record(0);
            setTimeout(() => {this.setState({playTimelineState: 'record'})}, 240000 / this.state.bpm); //magic number dont ask dont tell
        } else {
            this.setState({playTimelineState: newState});

            if (newState == 'play') {
                this.composer.play();
            } else if (newState == 'pause') {
                this.composer.pause();
            } else if (newState == 'stop') {
                this.composer.stop();
            }
        }
        
    }

    setMasterVolume = (e, newState) => {
        this.setState({masterVolume: newState});
        this.composer.setMasterVolume(this.state.masterVolume);
    }

    setBPM = (newState) => {
        this.setState({bpm: newState});
        this.composer.setBpm(this.state.bpm);
        console.log(this.composer.getBpm);
    }

    setKeyPressEvent = (keyPress, state) => {
        this.setState({keyPressEvent: [keyPress, state]});
    }

    setKeyPressValue = (keyPress, state) => {
        this.setState({keyPressEvent: keyPress, state});
    }

    submitHandler = (e) => {
        e.preventDefault();
        this.setBPM(parseInt(this.textFieldRef.current.value));
    }

    toggleMuteArray = (trackNo) => {
        let tempMuteArray = this.state.muteArray;
        tempMuteArray[trackNo] = this.state.muteArray[trackNo] == 1 ? 0 : 1; //ternary toggle 

        this.setState({
            muteArray: tempMuteArray
        });

        this.composer.setTrackMuteState(0, this.state.muteArray[0]);

        console.log("muteArray[" + trackNo + "] was toggled.")
    }

    toggleSoloArray = (trackNo) => {

    }

    getMuteArrayIndex = (trackNo) => {
        return this.state.muteIndex[trackNo];
    }

    keyDownCallback = (event) => {
        if (keyBindings.includes(event.code)) {
            let index = keyBindings.indexOf(event.code);
            console.log(index);

            if (index == 0)
                this.setState({octave: this.state.octave - 1});

            if (index == 1) 
                this.setState({octave: this.state.octave + 1});
        }


        if (toneKeys.includes(event.code) && this.state.playTimelineState === 'record') {
            if (!event.repeat) {
                this.setKeyPressEvent(event.code, 'down');
            }

            let index = toneKeys.indexOf(event.code);
            let note = ((this.state.octave + 1) * 12) + index;

            if (this.composer.keyboardState.indexOf(note) === -1) {
                this.composer.keyboardState.push(note);
            }
        }
    }

    keyUpCallback = (event) => {
        if (toneKeys.includes(event.code) && this.state.playTimelineState === 'record') {
            this.setKeyPressEvent(event.code, 'up')

            let index = toneKeys.indexOf(event.code);
            let note = ((this.state.octave + 1) * 12) + index;
            let nIndex = this.composer.keyboardState.indexOf(note);

            if (nIndex != -1) {
                this.composer.keyboardState.splice(nIndex, 1);
            }
        }
    }

    composerClearTrack = (trackNo) => {
        this.composer.clearTrack(trackNo);
    }

    componentDidMount() {
        this.rootDivRef.current.addEventListener('keydown', this.keyDownCallback);
        this.rootDivRef.current.addEventListener('keyup', this.keyUpCallback);
        //this.rootDivRef.current.focus();
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root} ref={this.rootDivRef} autoFocus tabIndex="0">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"></link>

                <div className={classes.controlsDiv}>
                    <ButtonGroup variant='contained' color='primary'>
                        <Button onClick={() => this.setPlayTimelineState('play')}><PlayArrowIcon/></Button>
                        <Button onClick={() => this.setPlayTimelineState('pause')}><PauseIcon/></Button>
                        <Button onClick={() => this.setPlayTimelineState('stop')}><StopIcon/></Button>
                        <Button onClick={() => this.setPlayTimelineState('record')}><FiberManualRecordIcon/></Button>
                        <Button onClick={() => this.composer.playMetronome()}>Metronome</Button>
                    </ButtonGroup>

                    <Grid container spacing={1}>
                        <Grid item>
                            <VolumeDown style={{position: 'relative', top: '10px'}}/>
                        </Grid>
                        <Grid item>
                            <Slider onChange={this.setMasterVolume} className={classes.masterVolumeSlider} defaultValue={1} min={0} max={2} step={0.01}>

                            </Slider>
                        </Grid>
                        <Grid item>
                            <VolumeUp style={{position: 'relative', top: '10px'}}/>
                        </Grid>
                    </Grid>

                    <form className={classes.BPM} noValidate autoComplete='off' onSubmit={this.submitHandler}>
                        <TextField defaultValue={this.state.bpm} label="BPM" inputRef={this.textFieldRef}/>
                    </form>
                </div>

                <div className={classes.trackDiv}>
                    <Track clearTrackCallback={() => this.composerClearTrack(0)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(0)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressEvent={this.state.keyPressEvent}/>
                    <Track clearTrackCallback={() => this.composerClearTrack(1)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(1)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressEvent={this.state.keyPressEvent}/>
                    <Track clearTrackCallback={() => this.composerClearTrack(2)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(2)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressEvent={this.state.keyPressEvent}/>
                    <Track clearTrackCallback={() => this.composerClearTrack(3)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(3)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressEvent={this.state.keyPressEvent}/>
                </div>

                <WidgetBar/>
            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(TrackManager);