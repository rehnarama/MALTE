import { TreeTheme } from "react-treebeard";

export default {
    tree: {
        base: {
            backgroundColor: "transparent"
        },
        node: {
            header: {
                base: {
                    color: "black",
                        display: 'inline-block',
                            verticalAlign: 'top'
                }
            },
            toggle: {
                base: {
                    position: 'relative',
                        display: 'inline-block',
                            verticalAlign: 'top',
                                marginLeft: '-5px',
                                    height: '24px',
                                        width: '24px'
                },
                wrapper: {
                    position: 'absolute',
                        top: '50%',
                            left: '50%',
                                margin: '-7px 0 0 -7px',
                                    height: '14px'
                },
                height: 12,
                    width: 12,
                        arrow: {
                    fill: '#000000',
                        strokeWidth: 0
                }
            }
        }
    }
} as TreeTheme;