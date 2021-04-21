import React, { useEffect } from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
//import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import TextField from '@material-ui/core/TextField'
import BPM from './BPM'
import Track from './Track'
import Composer from './Composer'

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
    },
    BPM: {

    },
});

class TrackManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            masterVolume: 1,
            bpm: 120,
            isRecording: false,
            muteArray: [0, 0, 0, 0],
            soloArray: [0, 0, 0, 0],
            playTimelineState: 'stop',
            composer: new Composer(),
        };

        this.state.composer.setMasterVolume(this.state.masterVolume);
        this.state.composer.setBpm(this.state.bpm);

        this.textFieldRef = React.createRef();
    }

    getTrackLength = () => {
        return (1/(this.state.bpm / 60)) * 16000;
    }

    setPlayTimelineState = (newState) => {
        if (newState === 'record') {
            setTimeout(() => this.setState({playTimelineState: newState}), 240000 / this.state.bpm); //magic number dont ask dont tell
        } else {
            this.setState({playTimelineState: newState});
        }
        
    }

    setIsRecording = (newState) => {
        this.setState({isRecording: newState});

        if (this.state.muteArray[0] != 1) {
            if (newState) {
                this.state.composer.record();
            } else {
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


    componentWillUnmount() {

    }

    render() {
        //const x y z = this.props;
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"></link>

                <div className={classes.controlsDiv}>
                    <ButtonGroup variant='contained' color='primary'>
                        <Button onClick={() => this.setPlayTimelineState('play')}>Play</Button>
                        <Button onClick={() => { this.setPlayTimelineState('pause'); this.setIsRecording(false); }}>Pause</Button>
                        <Button onClick={() => { this.setPlayTimelineState('stop'); this.setIsRecording(false); }}>Stop</Button>
                        <Button onClick={() => { this.setPlayTimelineState('record'); this.setIsRecording(true); }}>Record</Button>
                        <Button disabled="true">Composer Test</Button>
                    </ButtonGroup>

                    <Grid container spacing={1}>
                        <Grid item>
                            <VolumeDown />
                        </Grid>
                        <Grid item>
                            <Slider onChange={this.setMasterVolume} className={classes.masterVolumeSlider} defaultValue={1} min={0} max={2} step={0.01}>

                            </Slider>
                        </Grid>
                        <Grid item>
                            <VolumeUp />
                        </Grid>
                    </Grid>

                    <Button style={{ marginRight: 50, width: 120 }}>Metronome</Button>

                    <form className={classes.BPM} noValidate autoComplete='off' onSubmit={this.submitHandler}>
                        <TextField defaultValue={this.state.bpm} label="BPM" inputRef={this.textFieldRef}/>
                    </form>
                </div>

                <div className={classes.trackDiv}>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(0)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength}/>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(1)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength}/>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(2)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength}/>
                    <Track setPlayTimelineState={this.setPlayTimelineState} toggleMuteArray={() => this.toggleMuteArray(3)} playTimelineState={this.state.playTimelineState} getTrackLength={this.getTrackLength}/>
                </div>
            </div>
        );
    }


}



export default withStyles(useStyles, { withTheme: true })(TrackManager);