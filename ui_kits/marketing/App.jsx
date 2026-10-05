// App.jsx — composes the marketing page
const App = () => {
  return (
    <div className="kit-root">
      <NavBar/>
      <HeroBand/>
      <LogoStrip/>
      <FeatureBand/>
      <TabBand/>
      <DarkBand/>
      <PricingBand/>
      <Footer/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
