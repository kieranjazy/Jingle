import React, { useEffect, useImperativeHandle } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

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

class VisualNote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpanding: true,
            width: 1,
            height: 8.75,
        };

        this.expand = this.expand.bind(this);

        this.divRef = React.createRef();
        this.requestID = 0;  
    }

    componentDidMount = () => {
        console.log(this.divRef.current.style);
        this.divRef.current.style.left = String(this.props.xValue) + 'px';
        this.divRef.current.style.top = String(this.props.yValue) + 'px';
        this.requestID = setInterval(this.expand, 10);
    }

    expand() {
        if (this.state.isExpanding) {
            this.divRef.current.style.width = String(this.state.width) + 'px';
            this.setState({
                width: (this.state.width + 1),
            });
        } else {
            clearInterval(this.requestID);
        }
    }

    toggleIsExpanding() {
        this.setState({
            isExpanding: (!this.state.isExpanding),
        });
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

    setHeight(newValue) {
        this.setState({
            height: newValue,
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root} ref={this.divRef}>

            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true})(VisualNote);