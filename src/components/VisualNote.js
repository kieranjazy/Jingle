import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const useStyles = theme => ({
    root: {
        width: 1,
        height: 8.75,
        backgroundColor: 'chocolate',
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        border: '5px',
        borderColor: 'black'
    },

});

const parentTrackDivWidth = 1050;

class VisualNote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpanding: this.props.isExpandingByDefault,
            width: this.props.width,
        };

        this.expand = this.expand.bind(this);

        this.divRef = React.createRef();
        this.requestID = 0;
    }

    componentDidMount = () => {
        //console.log(this.divRef.current.style);
        this.divRef.current.style.left = String(this.props.xValue) + 'px';
        this.divRef.current.style.top = String(this.props.yValue) + 'px';
        this.divRef.current.style.width = String(this.props.width) + 'px';
        this.requestID = setInterval(this.expand, 10);
    }

    expand() {
        if (this.state.isExpanding) {
            if (this.divRef.current) {
                this.divRef.current.style.width = String(this.state.width) + 'px';

                this.setState({
                    width: (this.getTimelinePosition() - parseInt(this.divRef.current.style.left))
                })

            } else {
                this.toggleIsExpanding();
            }
        } else {
            clearInterval(this.requestID);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.yValue != prevProps.yValue) {
            this.divRef.current.style.top = String(this.props.yValue) + 'px';
        }

        if (this.props.height != prevProps.height) {
            console.log("height change")
            this.divRef.current.style.height = String(this.props.height) + 'px';
        }
    }

    getTimelinePosition() {
        return ((performance.now() - this.props.trackStartTimestamp()) / this.props.trackLength()) * parentTrackDivWidth;        
    }

    toggleIsExpanding() {
        this.setState({
            isExpanding: (!this.state.isExpanding),
        });
    }

    setIsExpanding = (newState) => {
        this.setState({
            isExpanding: newState,
        })
    }

    setYValue(newValue) {
        this.setState({
            yValue: newValue,
        });
    }

    setWidth(newValue) {
        this.setState({
            width: newValue,
        });
    }

    saveVisualNoteAsJSON() {
        return {
            width: this.state.width,
            height: this.props.height,
            yValue: this.props.yValue,
            xValue: this.props.xValue
        };
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root} ref={this.divRef}>

            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(VisualNote);