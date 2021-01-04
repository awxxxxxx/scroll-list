import React, { useRef, useState } from 'react';
import './App.css';
import { ScrollList, ScrollListProps } from './List'

function App() {
  const [data, setData] = useState(new Array(100).fill({name: 1}));
  const ref = useRef<ScrollList>(null);
  const renderItem: ScrollListProps['renderItem'] = ({ item, index }) => {
    return (
      <div className="item">
        {'#' + index}
      </div>
    )
  };

  const onEndReached = () => {
    setData([...data, ...new Array(100).fill({name: 1})])
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
          estimateRowHeight={40}
        />
      </header>
    </div>
  );
}

export default App;
