import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel';

const useStyles = makeStyles({
    root: {

    },
});

export default function BPM() {
    const classes = useStyles();
    const [BPM, setBPM] = React.useState(120);

    const bpmChange = (event) => {
        setBPM(Number(event.target.value));
        console.log(BPM);
    }

    return (
        <form className={classes.root} noValidate autoComplete='off'>
            <FormControlLabel control={<TextField defaultValue='120' onChange={bpmChange}/>} label="BPM"/>
        </form>
    );
}