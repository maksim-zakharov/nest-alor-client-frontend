import React, {FC, useEffect, useRef} from "react";
import {createChart, CrosshairMode} from "lightweight-charts";

interface IProps {
    items: { time: string, value: number }[];
}

const Chart: FC<IProps> = ({items}) => {
    const chartContainerRef = useRef<any>();

    useEffect(() => {

        const chart = createChart(chartContainerRef.current, {
            width: 400,
            height: 300,
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            grid: {
                vertLines: {
                    color: '#d9d9d9',
                },

                horzLines: {
                    color: '#d9d9d9',
                }
            },
        });

        chart.timeScale().fitContent();
        const lineSeries = chart.addLineSeries({
            color: '#1677ff'
        });
        if (items) {
            lineSeries.setData(Array.from(new Map<string, any>(items.map(i => [i.time, i]))).map(i => i[1]));
        }
    }, [chartContainerRef.current, items]);

    return <div
        style={{position: 'relative'}}
        ref={chartContainerRef}
    />
}

export default Chart;