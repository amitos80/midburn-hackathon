/**
 * Created by amit on 28/11/15.
 */
import React from "react";
import InlineCss from "react-inline-css";

export default class Canvas extends React.Component {


    componentDidMount () {
        this.draw = (x, y, type) => {
            if (type === "dragstart") {
                ctx.beginPath();
                return ctx.moveTo(x, y);
            } else if (type === "drag") {
                ctx.lineTo(x, y);
                return ctx.stroke();
            } else {
                return ctx.closePath();
            }
        }
        let canvas = document.createElement('canvas');
        canvas.height = 400;
        canvas.width = 800;

        document.getElementsByClassName('canvasWrapper')[0].appendChild(canvas);
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "solid";
        ctx.strokeStyle = "#ECD018";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        let socket = io.connect('http://localhost:4000');
        socket.on('draw', (data) => {
            return this.draw(data.x, data.y, data.type);
        });

        $('canvas').live('drag dragstart dragend', (e) => {
            var offset, type, x, y;
            type = e.handleObj.type;
            offset = $('canvas').offset();
            e.offsetX = e.layerX;
            e.offsetY = e.layerY;
            x = e.offsetX;
            y = e.offsetY;

            this.draw(x, y, type);

            socket.emit('drawClick', {
                x: x,
                y: y,
                type: type
            });
        });
    }

    render () {
        return (
            <InlineCss stylesheet={Canvas.css()} namespace="Canvas">
                <div className="canvasWrapper">hadar!! it works!

                </div>
            </InlineCss>


        );
    }


    static css () {
        return (`
            & canvas {
                margin: auto;
                font-family: sans-serif;
                background: #fff;
                margin: 20px auto;
                border: 5px solid #E8E8E8;
                display: block;
            }
        `);
    }
};