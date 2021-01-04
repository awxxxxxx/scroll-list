import React from 'react';

import './index.less';

export interface SwiperProps {
  selected: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  threshold: number;
};

interface State {
  animated: boolean;
}

export default class Swiper extends React.Component<SwiperProps, State> {
  startX = 0;
  startY = 0;
  currentX = 0;
  moveX = 0;
  moveY = 0;

  constructor(props: SwiperProps) {
    super(props);
    this.state = {
      animated: false,
    }
  }

  onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    this.startX = event.touches[0].pageX;
    this.startY = event.touches[0].pageY;
  }

  onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
    this.currentX = event.touches[0].pageX
    this.moveX = this.currentX - this.startX
    this.moveY = event.touches[0].pageY - this.startY

    if (Math.abs(this.moveY) > Math.abs(this.moveX)) {
      return
    }

    if (Math.abs(this.moveX) < 10 ) {
      return
    } else {
      this.setState({
        animated: true,
      })
    }

    this.props.onSelect?.();
  }

  onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    this.setState({
      animated: true
    })
  }

  onDelete = () => {
    this.setState({
      animated: false,
    });
    this.props.onDelete?.();
  }

  render() {
    const { selected, threshold } = this.props;
    const { animated } = this.state;
    const distance = this.moveX >= 0 ? 0 : -threshold;
    const innerStyle: {
      transform?: string;
      transition?: string;
      width?: string;
    } = {
      width: `calc(100% + ${threshold}px)`
    };

    if (animated && selected) {
      innerStyle.transform = `translateX(${distance}px)`;
      innerStyle.transition = 'transform 0.3s ease';
    }
    return (
      <div className="swiper-container">
        <div className="inner" style={innerStyle}>
          <div className="left"
            onTouchStart={this.onTouchStart}
            onTouchMove={this.onTouchMove}
            onTouchEnd={this.onTouchEnd}
          >
            {this.props.children}
          </div>
          <div className="right" onClick={this.onDelete} style={{width: threshold}}>
            删除
          </div>
        </div>
      </div>
    );
  }
}
