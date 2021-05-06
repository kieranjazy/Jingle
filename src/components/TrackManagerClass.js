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
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography'

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
});

const keyBindings = [
    "KeyZ", "KeyX",
];

const toneKeys = [
    "KeyA", "KeyW", "KeyS", "KeyE", "KeyD", "KeyF", "KeyT", "KeyG", "KeyY", "KeyH", "KeyU", "KeyJ", "KeyK", "KeyO", "KeyL", "KeyP"
];

class TrackManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            masterVolume: 0.5,
            bpm: 120,
            channels: 2,
            muteArray: [false, false, false, false],
            armArray: [1, 0, 0, 0],
            playTimelineState: 'stop',
            octave: 4,
            keyPressEvent: ['noKey', 'noState'],
            isSavingToJSON: false,
            isLoadingFromJSON: false, //These two are used to trigger the corresponding functions in child components which are not immediately accessible without refs
        };

        this.composer = new Composer();

        this.composer.setMasterVolume(this.state.masterVolume);
        this.composer.setBpm(this.state.bpm);

        this.textFieldRef = React.createRef();
        this.rootDivRef = React.createRef();

        this.composerSaveData = null;
        this.trackManagerSaveData = null;
    }

    getTrackLength = () => {
        return (1 / (this.state.bpm / 60)) * 16000;
        //return Math.floor((this.state.bpm*15.6249/this.state.bpm*0.00052083) * 1000000)
    }

    setPlayTimelineState = (newState) => {
        if (newState == this.state.playTimelineState && newState != 'stop')
            return;

        if (newState === 'record') {
            this.setState({ playTimelineState: 'recordPre' })

            let i = 0;
            for (; i != this.state.armArray.length; i++) {
                if (this.state.armArray[i]) {
                    this.composer.record(i);
                }

            }

            setTimeout(() => { this.setState({ playTimelineState: 'record' }) }, 240000 / this.state.bpm); //magic number dont ask dont tell
        } else {
            this.setState({ playTimelineState: newState });

            if (newState == 'play') {
                //console.log("Track 1 mute state: " + this.composer.getTrackMuteState(0) + " and Track 2 mute state: " + this.composer.getTrackMuteState(1))
                this.composer.play();
            } else if (newState == 'pause') {
                this.composer.pause();
            } else if (newState == 'stop') {
                this.composer.stop();
            }
        }

    }

    setMasterVolume = (e, newState) => {
        this.setState({ masterVolume: newState });
        this.composer.setMasterVolume(newState);
    }

    setChannels = (e, newState) => {
        this.setState({ channels: newState })
        this.composer.setNumberOfChannels(newState);
        console.log(this.composer.getNumberOfChannels())
    }

    setBPM = (newState) => {
        this.composer.setBpm(newState);
        this.setState({ bpm: newState });
        //console.log(this.composerServerWrapper.getManifest());

        // console.log(this.composer.getBpm());
    }

    setKeyPressEvent = (keyPress, state) => {
        this.setState({ keyPressEvent: [keyPress, state] });
    }

    setKeyPressValue = (keyPress, state) => {
        this.setState({ keyPressEvent: keyPress, state });
    }

    submitHandler = (e) => {
        e.preventDefault();
        this.setBPM(parseInt(this.textFieldRef.current.value));
    }

    toggleMuteArray = (trackNo) => {
        let tempMuteArray = this.state.muteArray;
        tempMuteArray[trackNo] = !this.state.muteArray[trackNo];

        this.setState({
            muteArray: tempMuteArray
        });

        this.composer.setTrackMuteState(trackNo, Boolean(tempMuteArray[trackNo]));
        //console.log(this.composer.getTrackMuteState());

        console.log("muteArray[" + trackNo + "] was toggled. Is now " + this.composer.getTrackMuteState(trackNo));
        console.log("Track 1 mute state: " + this.composer.getTrackMuteState(0) + " and Track 2 mute state: " + this.composer.getTrackMuteState(1))
    }

    getMuteArrayIndex = (trackNo) => {
        return this.state.muteArray[trackNo];
    }

    toggleArmArray = (trackNo) => {
        let tempArmArray = this.state.armArray;
        tempArmArray[trackNo] = this.state.armArray[trackNo] == 1 ? 0 : 1;

        this.setState({
            armArray: tempArmArray
        });

        //this.composer.setTrackArmState();
        console.log("armArray[" + trackNo + "] was toggled.");

    }

    getArmArrayIndex = (trackNo) => {
        return this.state.armArray[trackNo];
    }

    keyDownCallback = (event) => {
        if (keyBindings.includes(event.code)) {
            let index = keyBindings.indexOf(event.code);
            //console.log(index);

            if (index == 0)
                this.setState({ octave: this.state.octave - 1 });

            if (index == 1)
                this.setState({ octave: this.state.octave + 1 });
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

    renderMP3 = () => {
        //console.log(this.serverWrapper.getManifest());
        this.composer.renderMp3("main.mp3");
    }

    toggleIsSavingToJSON() {
        this.setState({
            isSavingToJSON: !this.state.isSavingToJSON
        });
    }

    toggleIsLoadingFromJSON() {
        this.setState({
            isLoadingFromJSON: !this.state.isLoadingFromJSON
        })
    }


    loadTrackManagerFromJSON() {
        if (this.trackManagerSaveData.length == 0) {
            console.log("Sorry, no data to load.");
            return;
        }


        this.composer.loadData(this.composerSaveData);

        if (this.trackManagerSaveData.length == 0) {
            console.log('Failed to load data for track manager');
        }
        let trackManagerData = JSON.parse(this.trackManagerSaveData);

        if (typeof (trackManagerData.masterVolume) != "undefined") {
            this.setState({
                masterVolume: trackManagerData.masterVolume
            })
        }

        if (typeof (trackManagerData.bpm) != "undefined") {
            this.setState({
                bpm: trackManagerData.bpm
            })
        }

        if (typeof (trackManagerData.channels) != "undefined") {
            this.setState({
                channels: trackManagerData.channels
            })
        }

        if (typeof (trackManagerData.muteArray) != "undefined") {
            this.setState({
                muteArray: trackManagerData.muteArray
            })
        }

    }

    saveTrackManagerToJSON() {
        this.composerSaveData = this.composer.saveData();

        let trackManagerSaveFile = {
            masterVolume: this.state.masterVolume,
            bpm: this.state.bpm,
            channels: this.state.channels,
            muteArray: this.state.muteArray
        };

        this.trackManagerSaveData = JSON.stringify(trackManagerSaveFile);
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root} ref={this.rootDivRef} autoFocus tabIndex="0">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"></link>

                <div className={classes.controlsDiv}>
                    <ButtonGroup variant='contained' color='primary'>
                        <Button onClick={() => this.setPlayTimelineState('play')}><PlayArrowIcon /></Button>
                        <Button onClick={() => this.setPlayTimelineState('pause')}><PauseIcon /></Button>
                        <Button onClick={() => this.setPlayTimelineState('stop')}><StopIcon /></Button>
                        <Button onClick={() => this.setPlayTimelineState('record')}><FiberManualRecordIcon /></Button>
                        <Button onClick={() => this.composer.playMetronome()}>Metronome</Button>
                    </ButtonGroup>

                    <Grid container spacing={1}>
                        <Grid item>
                            <VolumeDown style={{ position: 'relative', top: '10px' }} />
                        </Grid>
                        <Grid item>
                            <Slider onChange={this.setMasterVolume} className={classes.masterVolumeSlider} defaultValue={0.5} min={0} max={2} step={0.01}>

                            </Slider>
                        </Grid>
                        <Grid item>
                            <VolumeUp style={{ position: 'relative', top: '10px' }} />
                        </Grid>
                    </Grid>

                    <Typography>
                        Octave: {this.state.octave}
                    </Typography>

                    <ToggleButtonGroup style={{ marginRight: 15, backgroundColor: '#3f51b5' }} value={this.state.channels} exclusive onChange={this.setChannels}>
                        <ToggleButton style={{ color: 'white' }} value={1}>
                            Mono
                        </ToggleButton>

                        <ToggleButton style={{ color: 'white' }} value={2}>
                            Stereo
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <form className={classes.BPM} noValidate autoComplete='off'>
                        <TextField defaultValue={this.state.bpm} label="BPM" inputRef={this.textFieldRef} onChange={this.submitHandler} />
                    </form>
                </div>

                <div className={classes.trackDiv}>
                    <Track isLoadingFromJSON={this.state.isLoadingFromJSON} isSavingToJSON={this.state.isSavingToJSON} changePan={(newPan) => { this.composer.panTrack(0, newPan); }} clearTrackCallback={() => this.composerClearTrack(0)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(0)} toggleArmArray={() => this.toggleArmArray(0)} getArmArrayIndex={() => this.getArmArrayIndex(0)} playTimelineState={this.state.playTimelineState} getTrackLength={() => this.getTrackLength()} keyPressEvent={this.state.keyPressEvent} />
                    <Track isLoadingFromJSON={this.state.isLoadingFromJSON} isSavingToJSON={this.state.isSavingToJSON} changePan={(newPan) => { this.composer.panTrack(1, newPan); }} clearTrackCallback={() => this.composerClearTrack(1)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(1)} toggleArmArray={() => this.toggleArmArray(1)} getArmArrayIndex={() => this.getArmArrayIndex(1)} playTimelineState={this.state.playTimelineState} getTrackLength={() => this.getTrackLength()} keyPressEvent={this.state.keyPressEvent} />
                    <Track isLoadingFromJSON={this.state.isLoadingFromJSON} isSavingToJSON={this.state.isSavingToJSON} changePan={(newPan) => { this.composer.panTrack(2, newPan); }} clearTrackCallback={() => this.composerClearTrack(2)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(2)} toggleArmArray={() => this.toggleArmArray(2)} getArmArrayIndex={() => this.getArmArrayIndex(2)} playTimelineState={this.state.playTimelineState} getTrackLength={() => this.getTrackLength()} keyPressEvent={this.state.keyPressEvent} />
                    <Track isLoadingFromJSON={this.state.isLoadingFromJSON} isSavingToJSON={this.state.isSavingToJSON} changePan={(newPan) => { this.composer.panTrack(3, newPan); }} clearTrackCallback={() => this.composerClearTrack(3)} composerOctave={this.state.octave} setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(3)} toggleArmArray={() => this.toggleArmArray(3)} getArmArrayIndex={() => this.getArmArrayIndex(3)} playTimelineState={this.state.playTimelineState} getTrackLength={() => this.getTrackLength()} keyPressEvent={this.state.keyPressEvent} />
                </div>

                <WidgetBar renderMP3Callback={() => { this.renderMP3() }} composerSaveDataCallback={() => {
                    this.toggleIsSavingToJSON();
                    this.saveTrackManagerToJSON();
                    this.toggleIsSavingToJSON();
                }} composerLoadDataCallback={() => {
                    if (this.trackManagerSaveData != null) {
                        this.toggleIsLoadingFromJSON();
                        this.loadTrackManagerFromJSON();
                        this.toggleIsLoadingFromJSON();
                    }
                }} arpeggiatorToggleCallback={() => {
                    this.composer.setArpeggioState(0, !this.composer.getArpeggioState(0));
                }} arpeggiatorChangeCallback={(newSpeed) => {
                    this.composer.setArpeggioSpeed(0, newSpeed * 1);
                }} setTrackInstrumentCallback={(trackNo, index) => {
                    this.composer.setTrackInstrument(trackNo, index - 1);
                }}
                />
            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(TrackManager);