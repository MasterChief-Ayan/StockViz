# StockViz - Stock Market Visualization Dashboard
A React-based interactive dashboard for visualizing stock market data using D3.js. This project offers multiple visualization types and customization options to analyze financial data.

## Project Description
StockViz allows users to visualize stock market data for different companies (Tesla, Apple, Microsoft, Alibaba, NASDAQ) across various timeframes. The application features three different visualization types (Line, Bar, and Pie charts), each providing unique insights into stock performance. The project includes a theme switcher for light/dark mode and responsive design for optimal viewing across devices.

## Features Implemented
- **Multiple Chart Types**: Line, Bar, and Pie charts for different visualization perspectives
- **Interactive Data Selection**: Choose from multiple stocks, timeframes, and date ranges
- **Dynamic Data Visualization via API Calls**: Charts update automatically when selections change 
- **Time Range Selection**: View data by minute, hour, day, or week
- **Custom Date Range**: Specify start and end dates for data display
- **Dark/Light Theme Switching**: Toggle between themes for better viewing comfort
- **Interactive Elements**:
  - Tooltips display detailed information on hover
  - Animated transitions between data states
  - Highlights for significant data points (min/max values)
- **Responsive Design**: Adapts to different screen sizes
- **Data Aggregation**: Automatic data processing for optimal visualization
## Chart Types Overview
### Line Chart
The Line chart displays stock prices over time with a continuous line, making it excellent for identifying trends and patterns.

### Key features:

- Interactive price line with smooth animation
- Highlighted maximum and minimum price points
- Tooltips showing detailed price information on hover
- Moving average line for trend analysis
- Date-formatted x-axis adapting to the selected timeframe
- Animated entry of data points

### Bar Chart
The Bar chart presents stock prices as discrete bars, making it easy to compare values across specific time periods.

### Key features:

- Color-coded bars based on price movement (up/down)
- Interactive hover effects with detailed tooltips
- Highlighted highest and lowest values
- Daily aggregation for minute/hour data to prevent overcrowding
- Responsive spacing that adjusts to data density
- Smooth animations for data transitions

### Pie Chart
The Pie chart visualizes volume distribution across trading days, providing insight into trading activity patterns.

### Key features:

- Proportional representation of trading volumes
- Interactive segments with detailed volume information on hover
- Automatic grouping of smaller segments for clarity
- Highest and lowest volume annotations
- Average volume statistics
- Animated entry with sweeping transitions

## Technologies Used
- React: Frontend UI library for building the component-based interface
- Redux Toolkit: State management for application data
- D3.js: Data visualization library for creating interactive charts
- CSS3: Styling with modern CSS features
- JavaScript ES6+: Modern JavaScript for application logic

## Project Architecture
The project follows a modular component structure:

- Store.js: Redux store configuration with slices for:
  - Graph type selection
  - Asset (stock) selection
  - Timespan configuration
  - Theme settings
  - Date range selection
    
- Components:
  - Navbar: Application header with theme toggle
  - Input: Selection controls for visualization parameters
  - Display: Container for displaying the selected visualization
    
- Visualization Modules:
  - Line chart producer
  - Bar chart producer
  - Pie chart producer

## How to Run Locally
Clone the repository:
```
git clone [repository-url]
cd datavisual1
```
Install dependencies:
```
npm install
```
Start the development server:
```
npm start
```
Open your browser and navigate to:
```
http://localhost:3000
```


## Dependencies
- React
- Redux Toolkit
- D3.js
- React Icons

## Future Improvements
- Add zoom and pan capabilities for exploring detailed data
- Implement cross-chart interactions
- Add export functionality for charts
- Include more technical indicators for advanced analysis
- Support for comparing multiple stocks simultaneously
