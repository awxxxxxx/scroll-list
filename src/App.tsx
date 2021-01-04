import React, { useRef, useState } from 'react';
import './App.css';
import { ScrollList, ScrollListProps } from './List';
import Swiper from './Swiper';

function App() {
  const [data, setData] = useState(new Array(100).fill(0).map((value, index) => ({ index })));
  const ref = useRef<ScrollList>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const renderItem: ScrollListProps['renderItem'] = ({ item, index }) => {
    return (
      <Swiper
        selected={currentIndex === index}
        threshold={60}
        onSelect={() => setCurrentIndex(index)}
        onDelete={() => {
          const items = [...data];
          items.splice(index, 1);
          if (ref.current) {
            ref.current.deleteRow(index);
          }
          setCurrentIndex(-1);
          setData(items);
        }}
      >
        <div className="item">
          {'#' + index + '-' + item.index }
        </div>
      </Swiper>
    )
  };

  const onEndReached = () => {
    // setData([...data, ...new Array(100).fill(0).map((value, index) => ({ index: data.length + index }))])
    console.log('end reached');
  };

  return (
    <div className="App">
      <header className="App-header">
        <ScrollList
          ref={ref}
          renderItem={renderItem}
          data={data}
          height={window.innerHeight}
          onEndReached={onEndReached}
          estimateRowHeight={50}
        />
      </header>
    </div>
  );
}

export default App;
