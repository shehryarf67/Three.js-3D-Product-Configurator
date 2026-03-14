

const CircleFloating = () => {
  // Default circles if none provided
  const defaultCircles = [
    { top: "20%", left: "10%", delay: "2s", size: "100px" },
    { top: "40%", left: "80%", delay: "4s", size: "100px" },
    { top: "70%", left: "30%", delay: "6s", size: "100px" },
    { top: "50%", left: "50%", delay: "8s", size: "100px" },
    { top: "10%", right: "20%", delay: "10s", size: "100px" },
  ];

  return (
    <>
      {defaultCircles.map((circle, index) => (
        <div
          key={index}
          className="floating-circle"
          style={{
            top: circle.top,
            left: circle.left,
            right: circle.right,
            width: circle.size,
            height: circle.size,
            animationDelay: circle.delay,
          }}
        />
      ))}
    </>
  );
};

export default CircleFloating;