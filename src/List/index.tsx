import React from 'react';

import './index.less'

export interface ScrollListProps {
  data: any[];
  // 渲染每列的内容
  renderItem: (item: {item: any, index: number }) => any;
  // 用于设置 unique key
  keyExtractor?: (item: any, index: number) => string;
  // 预估 row 的高度，用于动态渲染
  estimateRowHeight: number;
  // 可视区域高度
  height: number;
  onScroll?: (item: {viewport: number, scrollTop: number }) => void;
  onViewableItemsChanged?: (info: {viewableItems: any[], start: number, end: number }) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRowDeleted?: () => void;
}

interface State {
  startOffset: number;
  endOffset: number;
  viewableItems: any[];
}

interface Item {
  index: number;
  top: number;
  bottom: number;
}

const bottomBuffer = 5;

export class ScrollList extends React.Component<ScrollListProps, State> {
  // 可见区域的第一个元素
  startIndex = 0;
  // 可见区域最后一个元素
  endIndex = 0;

  scrollRef = React.createRef<HTMLDivElement>();
  scrollTop = 0;

  firstItem = {
    index: 0,
    top: 0,
    bottom: 0
  };
  itemCache: Item[] = [];
  viewableCount = 0;
  calledEndReached = false;

  constructor (props: ScrollListProps) {
    super(props);
    this.state = {
      startOffset: 0,
      endOffset: 0,
      viewableItems: [],
    }
  }

  componentDidMount() {
    const { height, estimateRowHeight } = this.props;
    this.viewableCount = Math.ceil(height / estimateRowHeight) + bottomBuffer;
    this.endIndex = this.startIndex + this.viewableCount;
    this.updateItems();
  }

  componentDidUpdate(prevProps: ScrollListProps) {
    if (prevProps.data.length !== this.props.data.length) {
      this.calledEndReached = false;
      this.updateItems();
    }
  }

  memorizeItem = (elem: HTMLDivElement, index: number) => {
    const rect = elem.getBoundingClientRect();
    const top = rect.top + this.scrollTop;

    this.itemCache.push({
      index,
      top,
      bottom: top + rect.height,
    });
  }

  onScroll = () => {
    if (!this.scrollRef.current) {
      return;
    }

    const scrollTop = this.scrollRef.current.scrollTop;
    if (
      ((scrollTop > this.scrollTop) && (scrollTop > this.firstItem.bottom)) ||
      ((scrollTop < this.scrollTop) && (scrollTop < this.firstItem.top))
    ) {
      this.calcIndex(scrollTop);
      this.updateItems();
    }

    this.scrollTop = scrollTop
    this.props.onScroll?.({ scrollTop, viewport: this.props.height });
  };

  renderItems = (data: any[]) => {
    const { renderItem, keyExtractor } = this.props;
    const items = data.map((item, index) => {
      const key = keyExtractor ? keyExtractor(item, index) : item.key ? item.key : index;
      return (
        <div key={key} ref={(node) => {
          if (node) {
            this.memorizeItem(node, this.startIndex + index );
          }
        }}>
          { renderItem({item, index: this.startIndex + index }) }
        </div>
      )
    });
    return items;
  }

  deleteRow = (index: number) => {
    const cacheIndex = this.findCacheRow(index);
    if (cacheIndex !== -1) {
      this.itemCache.splice(cacheIndex, 1);
    }
  };

  findCacheRow = (index: number) => {
    let start = 0;
    let end = this.itemCache.length;
    while(start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (this.itemCache[mid].index === index) {
        return mid;
      } else if (this.itemCache[mid].index > index) {
        end--;
      } else {
        start++;
      }
    }
    return -1;
  }

  findFirst(scrollTop: number) {
    const { estimateRowHeight }  = this.props;

    // 使用预估高度计算一个预估的 index
    let estimateIndex = Math.floor(scrollTop / estimateRowHeight);
    const top = this.itemCache[estimateIndex];

    if (!top) {
      return null;
    }

    if (top.bottom === scrollTop) {
      return top;
    }

    // 根据预估的高度找到最近的边界值
    if (top.bottom > scrollTop) {
      while (estimateIndex >= 1 && this.itemCache[estimateIndex].bottom >= scrollTop) {
        estimateIndex--;
      }
    } else {
      while(estimateIndex < this.itemCache.length - 1 && this.itemCache[estimateIndex].bottom < scrollTop) {
        estimateIndex++;
      }
    }
    return this.itemCache[estimateIndex] || null;
  }

  calcIndex(scrollTop: number) {
    const item = this.findFirst(scrollTop);
    scrollTop = scrollTop || 0;

    if (!item) {
      return;
    }

    this.firstItem = {
      ...item,
    }
    this.startIndex = this.firstItem.index;
    this.endIndex = this.startIndex + this.viewableCount;


    const threshold = this.props.onEndReachedThreshold || bottomBuffer;
    if (Math.abs(this.endIndex - this.props.data.length) <=  threshold) {
      if (!this.calledEndReached) {
        this.props.onEndReached?.();
        this.calledEndReached = true;
      }
    }
  }

  updateItems() {
    const { data, estimateRowHeight, onViewableItemsChanged } = this.props;
    const items = data.slice(this.startIndex, this.endIndex);
    onViewableItemsChanged?.({ viewableItems: items, start: this.startIndex, end: this.endIndex });
    this.setState({
      startOffset: this.firstItem.top,
      endOffset: (data.length - this.endIndex) * estimateRowHeight,
      viewableItems: items,
    });
  }

  render () {
    const { height } = this.props;
    const { startOffset, endOffset, viewableItems } = this.state

    return (
      <div
        className='scroll-list-container'
        ref={this.scrollRef}
        onScroll={this.onScroll}
        style={{ height }}
      >
        <div style={{ paddingTop: `${startOffset}px`, paddingBottom: `${endOffset}px` }}>
          { this.renderItems(viewableItems) }
        </div>
      </div>
    )
  }
}


