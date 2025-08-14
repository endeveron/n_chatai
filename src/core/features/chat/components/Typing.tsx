const Typing = () => {
  return (
    <div className="flex items-center m-8">
      <div className="typing_circle" style={{ animationDelay: '0.4s' }}></div>
      <div
        className="typing_circle ml-2"
        style={{ animationDelay: '0.6s' }}
      ></div>
      <div
        className="typing_circle ml-2"
        style={{ animationDelay: '0.8s' }}
      ></div>
    </div>
  );
};

export default Typing;
