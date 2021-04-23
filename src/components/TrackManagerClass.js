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
    "KeySpace"
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
            composer: new Composer(),
            octave: 4,
            keyPressState: 'none',
            keyPressValue: 'none'
        };

        this.state.composer.setMasterVolume(this.state.masterVolume);
        this.state.composer.setBpm(this.state.bpm);

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
            this.state.composer.record(0);
            setTimeout(() => {this.setState({playTimelineState: 'record'})}, 240000 / this.state.bpm); //magic number dont ask dont tell
        } else {
            this.setState({playTimelineState: newState});

            if (newState == 'play') {
                this.state.composer.play();
            } else if (newState == 'pause') {
                this.state.composer.pause();
            } else if (newState == 'stop') {
                this.state.composer.stop();
            }
        }
        
    }

    setMasterVolume = (e, newState) => {
        this.setState({masterVolume: newState});
        this.state.composer.setMasterVolume(this.state.masterVolume);
    }

    setBPM = (newState) => {
        this.setState({bpm: newState});
        this.state.composer.setBpm(this.state.bpm);
    }

    setKeyPressState = (newState) => {
        this.setState({keyPressState: newState});
    }

    setKeyPressValue = (newState) => {
        this.setState({keyPressValue: newState});
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

        console.log("muteArray[" + trackNo + "] was toggled.")
    }

    toggleSoloArray = (trackNo) => {

    }

    keyDownCallback = (event) => {
        if (toneKeys.includes(event.code) && this.state.playTimelineState === 'record') {
            if (!event.repeat) {
                this.setKeyPressState('down');
                this.setKeyPressValue(event.code);
            }

            let index = toneKeys.indexOf(event.code);
            let note = ((this.state.octave + 1) * 12) + index;

            if (this.state.composer.activeNotes.indexOf(note) === -1) {
                this.state.composer.activeNotes.push(note);
                console.log(this.state.composer.activeNotes);
            }
        }
    }

    keyUpCallback = (event) => {
        if (toneKeys.includes(event.code) && this.state.playTimelineState === 'record') {
            this.setKeyPressState('up');

            let index = toneKeys.indexOf(event.code);
            let note = ((this.state.octave + 1) * 12) + index;
            let nIndex = this.state.composer.activeNotes.indexOf(note);

            if (nIndex != -1) {
                this.state.composer.activeNotes.splice(nIndex, 1);
                console.log(this.state.composer.activeNotes);
            }
        }
    }

    componentDidMount() {
        this.rootDivRef.current.addEventListener('keydown', this.keyDownCallback);
        this.rootDivRef.current.addEventListener('keyup', this.keyUpCallback);
        //this.rootDivRef.current.focus();
    }


    componentWillUnmount() {

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

                    <Button style={{ marginRight: 50, width: 120 }}>Metronome</Button>

                    <form className={classes.BPM} noValidate autoComplete='off' onSubmit={this.submitHandler}>
                        <TextField defaultValue={this.state.bpm} label="BPM" inputRef={this.textFieldRef}/>
                    </form>
                </div>

                <div className={classes.trackDiv}>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(0)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressState={this.state.keyPressState} keyPressValue={this.state.keyPressValue}/>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(1)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressState={this.state.keyPressState} keyPressValue={this.state.keyPressValue}/>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(2)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressState={this.state.keyPressState} keyPressValue={this.state.keyPressValue}/>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(3)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength} keyPressState={this.state.keyPressState} keyPressValue={this.state.keyPressValue}/>
                </div>
            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(TrackManager);