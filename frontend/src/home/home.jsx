import React, { useRef, useState } from "react";
import leftButton from '../../public/assets/left.png';
import rightButton from '../../public/assets/right.png';
import CollegeImage1 from '../../public/assets/college.jpg';
import CollegeImage2 from '../../public/assets/college2.jpg';
import CollegeImage3 from '../../public/assets/college3.jpg';
import CollegeImage4 from '../../public/assets/college4.jpg';
import CollegeImage5 from '../../public/assets/college5.jpg';
import CollegeImage6 from '../../public/assets/college6.jpg';
import './home.css'

const Home = () => {
  const imgRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    CollegeImage1,
    CollegeImage2,
    CollegeImage3,
    CollegeImage4,
    CollegeImage5,
    CollegeImage6,
  ];

  const scrollToImage = (index) => {
    if (imgRef.current) {
      const imageWidth = imgRef.current.children[0]?.offsetWidth || 300;
      imgRef.current.scrollTo({
        left: index * imageWidth,
        behavior: "smooth"
      });
      setCurrentIndex(index);
    }
  };

  const scroll = (direction) => {
    let newIndex;
    
    if (direction === "right") {
      newIndex = currentIndex + 1 >= images.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1;
    }
    
    scrollToImage(newIndex);
  };

  return (
    <div className="home">
      <h1>Welcome to Git College</h1>
      <p>Learn and Grow Your Skills</p>

      <div className="carousel-container">
        {/* Left Button */}
        <button 
          className="scroll-btn left" 
          onClick={() => scroll("left")}
          aria-label="Previous image"
        >
          <img src={leftButton} alt="Previous" />
        </button>

        {/* Image Wrapper - Shows only one image at a time */}
        <div className="img-wrapper" ref={imgRef}>
          {images.map((img, index) => (
            <div key={index} className="image-item">
              <img 
                src={img} 
                alt={`college ${index + 1}`} 
                className="carousel-image"
              />
            </div>
          ))}
        </div>

        {/* Right Button */}
        <button 
          className="scroll-btn right" 
          onClick={() => scroll("right")}
          aria-label="Next image"
        >
          <img src={rightButton} alt="Next" />
        </button>

        {/* Dots Indicator */}
        <div className="dots-container">
          {images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => scrollToImage(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;