import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
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

const useStyles = makeStyles({
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

const StartTimeline = () => {
    const trackRef = React.createRef(null);
    const [playTimeline, setPlayTimeline] = React.useState('stop');

    useEffect(() => {
        const track = trackRef.current;
        if (playTimeline === 'play') {
            track.timelineAnimationChange('play');
        } else if (playTimeline === 'stop') {
            track.timelineAnimationChange('stop');
        } else if (playTimeline === 'pause') {
            track.timelineAnimationChange('pause');
        }
    }, [playTimeline]);

    return [playTimeline, setPlayTimeline, trackRef];
}

export default function TrackManager() {
    const classes = useStyles();
    const [masterVolume, setMasterVolume] = React.useState(100); //from 0% to 200%
    const [BPM, setBPM] = React.useState(120);
    const [record, setRecord] = React.useState(false);

    const [muteArray, setMuteArray] = React.useState([0, 1, 1, 1]);

    const [playTimeline1, setPlayTimeline1, trackRef1] = StartTimeline();
    const [playTimeline2, setPlayTimeline2, trackRef2] = StartTimeline();
    const [playTimeline3, setPlayTimeline3, trackRef3] = StartTimeline();
    const [playTimeline4, setPlayTimeline4, trackRef4] = StartTimeline();

    //const composer = new Composer();
    let composer;

    useEffect(() => {
        composer = new Composer();
    }, [])

    const volumeChange = (event, newValue) => {
        setMasterVolume(newValue);
    }

    useEffect(() => {
        composer.setMasterVolume(masterVolume);
    }, [masterVolume]);

    useEffect(() => {
        composer.setBpm(BPM);
        composer.setNumberOfChannels(2); //maybe slide this line elsewhere
    }, [BPM]);

    useEffect(() => {
        //Check mute state of each Track component
        //If Track is not muted, then call composer.record(trackNo) for each trackNo.
        if (record) { //If record is being set to true do
            let i;
            for (i = 0; i != 4; i++) {
                if (!muteArray[i]) 
                    composer.record(i);
            }
        } else {
            composer.stop();
        }


    }, [record]);

    const toggleMuteArray = (trackNo) => {
        let tempMuteArray = muteArray;
        tempMuteArray[trackNo] = muteArray[trackNo] == 1 ? 0 : 1; //ternary toggle 
        setMuteArray(tempMuteArray);

        console.log("muteArray[" + trackNo + "] was toggled.")
    }

    const setPlayTimelines = (newState) => {
        setPlayTimeline1(newState);
        setPlayTimeline2(newState);    
        setPlayTimeline3(newState);
        setPlayTimeline4(newState);
    }

    /*
    const composerTest = () => {
        composer.setBpm(120);
        composer.setMasterVolume(1);
        composer.setNumberOfChannels(1);
        composer.record(0);
    }
    */


    return (
        <div className={classes.root}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"></link>

            <div className={classes.controlsDiv}>
                <ButtonGroup variant='contained' color='primary'>
                    <Button onClick={() => { setPlayTimeline1('play'); setPlayTimeline2('play'); setPlayTimeline3('play'); setPlayTimeline4('play'); }}>Play</Button>
                    <Button onClick={() => { setPlayTimeline1('pause'); setPlayTimeline2('pause'); setPlayTimeline3('pause'); setPlayTimeline4('pause'); setRecord(false); }}>Pause</Button>
                    <Button onClick={() => { setPlayTimeline1('stop'); setPlayTimeline2('stop'); setPlayTimeline3('stop'); setPlayTimeline4('stop'); setRecord(false); }}>Stop</Button>
                    <Button onClick={() => { setPlayTimeline1('play'); setPlayTimeline2('play'); setPlayTimeline3('play'); setPlayTimeline4('play'); setRecord(true); }}>Record</Button>
                    <Button disabled="true">Composer Test</Button>
                </ButtonGroup>

                <Grid container spacing={1}>
                    <Grid item>
                        <VolumeDown />
                    </Grid>
                    <Grid item>
                        <Slider value={masterVolume} onChange={volumeChange} className={classes.masterVolumeSlider} defaultValue={100} min={0} max={200}>

                        </Slider>
                    </Grid>
                    <Grid item>
                        <VolumeUp />
                    </Grid>
                </Grid>

                <Button style={{ marginRight: 50, width: 120 }}>Metronome</Button>

                <form className={classes.BPM} noValidate autoComplete='off'>
                    <TextField defaultValue='120' onChange={(e, newBPM) => setBPM(newBPM)} label="BPM" />
                </form>
            </div>

            <div className={classes.trackDiv}>
                <Track ref={trackRef1} setPlayTimeline={setPlayTimeline1} toggleMuteArray={() => this.toggleMuteArray(0)} />
                <Track ref={trackRef2} setPlayTimeline={setPlayTimeline2} toggleMuteArray={() => this.toggleMuteArray(1)} />
                <Track ref={trackRef3} setPlayTimeline={setPlayTimeline3} toggleMuteArray={() => this.toggleMuteArray(2)} />
                <Track ref={trackRef4} setPlayTimeline={setPlayTimeline4} toggleMuteArray={() => this.toggleMuteArray(3)} />
            </div>
        </div>
    );
}