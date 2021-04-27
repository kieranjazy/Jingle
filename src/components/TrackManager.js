import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
//import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import BPM from './BPM'
import Track from './Track'

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
});

const StartTimeline = () => {
    const trackRef = React.createRef(null);
    const [playTimeline, setPlayTimeline] = React.useState(0);

    useEffect(() => {
        const track = trackRef.current;
        if (playTimeline === 1) {
            track.timelineAnimationChange(1);
        }
    });

    return [playTimeline, setPlayTimeline, trackRef];
}

export default function TrackManager() {
    const classes = useStyles();
    const [masterVolume, setMasterVolume] = React.useState(100); //from 0% to 200%

    const [playTimeline1, setPlayTimeline1, trackRef1] = StartTimeline();
    const [playTimeline2, setPlayTimeline2, trackRef2] = StartTimeline();
    const [playTimeline3, setPlayTimeline3, trackRef3] = StartTimeline();
    const [playTimeline4, setPlayTimeline4, trackRef4] = StartTimeline();

    const volumeChange = (event, newValue) => {
        setMasterVolume(newValue);
    }

    return (
        <div className={classes.root}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"></link>

            <div className={classes.controlsDiv}>
                <ButtonGroup variant='contained' color='primary'>
                    <Button onClick={() => {setPlayTimeline1(1); setPlayTimeline2(1); setPlayTimeline3(1); setPlayTimeline4(1);}}>Play</Button>
                    <Button>Pause</Button>
                    <Button>Stop</Button>
                    <Button>Record</Button>
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

                <BPM />
            </div>

            <div className={classes.trackDiv}>
                <Track ref={trackRef1}/>
                <Track ref={trackRef2}/>
                <Track ref={trackRef3}/>
                <Track ref={trackRef4}/>
            </div>
        </div>
    );
}