import React from 'react';
import { Button, Form, Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { generateImage } from './generate.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedImageURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      uploaded: false,
      model_name: "hayao",
      fp16: 0,
      resize: "l",
      generationStatus: 0,
      updateGenerationgresProsInterval: -1,
      bytesUsed: 0
    };
  }

  onUpload = (e) => {
    var input = e.target;
    var reader = new FileReader();
    reader.onload = () => {
      var dataURL = reader.result;
      this.setState({
        uploadedImageURL: dataURL,
        uploaded: true
      });
    };
    reader.readAsDataURL(input.files[0]);
  }

  generate = async () => {
    if (this.state.generationStatus !== 0) {
      return;
    }

    console.log(this.state);
    if (this.state.uploaded === false) {
      alert("Please upload an image.");
      return;
    }
    if (this.state.resize === "none") {
      alert("Please select a resize method.");
      return;
    }

    window.progress = 0;
    window.bytesUsed = 0;
    let updateGenerationProgressInterval = setInterval(() => {
      this.setState({
        generationProgress: window.progress * 100,
        bytesUsed: window.bytesUsed
      });

      if (this.state.generationStatus !== 1) {
        clearInterval(updateGenerationProgressInterval);
      }
    }, 500);


    this.setState({
      generationStatus: 1,
      updateGenerationProgressInterval: updateGenerationProgressInterval
    });
    let success = false;
    try {
      await generateImage(this.state.model_name, this.state.resize, this.state.fp16, "uploaded-image", "output");
      success = true;
    } catch (error) {
      alert("Error encountered while generating image: " + error);
      this.setState({
        generationStatus: 0
      });
    }

    if (success) {
      this.setState({
        generationStatus: 2
      });
    }

  }

  componentWillUnmount = () => {
    if (this.state.updateGenerationProgressInterval !== -1) {
      clearInterval(this.state.updateGenerationProgressInterval);
    }
  }

  render() {
    return (
      <div className="app">
        <Container fluid style={{ "display": this.state.generationStatus === 0 ? "block" : "none" }}>
          <Row className="margin">
            <Col />
            <Col xs="12">
              <h1 style={{ "marginBottom": "20px", textAlign: "center" }}>AnimeGAN-js beta </h1>
            </Col>
            <Col />
          </Row>
          <Row className="margin">
            <Col />
            <Col xs="12" md="8" lg="6">
              <Form>
                <Form.File accept="image/*" label={(this.state.uploaded ? "Change the image" : "이미지 업로드")} onChange={this.onUpload} multiple={false} custom />
              </Form>

            </Col>
            <Col />
          </Row>
          <Row className="margin">
            <Col />
            <Col xs="12" md="8" lg="5" xl="4" style={{ textAlign: "center", margin: "20px" }}>
              <img id="uploaded-image" alt="" src={this.state.uploadedImageURL} />
            </Col>
            <Col />
          </Row>
          <Row className="margin">
            <Col />
            <Col xs="12" md="8" lg="6" style={{ textAlign: "center" }}>
              <Form>

                <Form.Group controlId="model_name">
                  <Form.Control as="select" onChange={(e) => this.setState({ model_name: e.target.value })}>
                    <option value="hayao">미야자키 하야오</option>
                    <option value="paprika">파프리카</option>
                    <option value="shinkai">신카이</option>
                    <option value="strange_daddy">이상한 아빠의 식성</option>
                    <option value="charge">차지</option>
                    <option value="iblard">이발라드</option>

                  </Form.Control>
                </Form.Group>


                <Form.Group controlId="resize">
                  <Form.Control defaultValue="l" as="select" onChange={(e) => this.setState({ resize: e.target.value })}>
                    <option value="l">고화질</option>

                    {/* <option value="none" disabled>Select Generated Image Size</option> */}
                    <option value="m">저화질</option>
                    <option value="original">원본(추천안함)</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="fp16">
                  <Form.Control as="select" onChange={(e) => this.setState({ fp16: parseInt(e.target.value) })}>
                    <option value="0">WEB_GL FP16: False</option>
                    <option value="1">WEB_GL FP16: True</option>
                  </Form.Control>
                </Form.Group>


                <Button variant="primary" onClick={this.generate}>Generate</Button>
              </Form>
            </Col>
            <Col />
          </Row>
        </Container>

        <div className="overlay" style={{ "display": this.state.generationStatus === 1 ? "block" : "none" }}>

          <div style={{ "marginTop": "calc( 50vh - 50px )", "height": "100px", "textAlign": "center" }}>
            <Container fluid>
              <Row>
                <Col />
                <Col xs="12" md="8" lg="6" style={{ textAlign: "center" }}>
                  <ProgressBar now={this.state.generationProgress} style={{ "margin": "10px" }} />
                  <p>Generating image...</p>
                  <p>This may take 15 to 30 seconds depending on your device.</p>
                  <p>Memory usage (MB): {this.state.bytesUsed / 1000000} </p>
                </Col>
                <Col />
              </Row>
            </Container>
          </div>

        </div>

        <div className="overlay" style={{ "display": this.state.generationStatus === 2 ? "block" : "none" }}>
          <Container fluid>
            <Row className="margin">
              <Col />
              <Col xs="12" md="8" lg="5" xl="4" style={{ textAlign: "center", margin: "20px" }}>
                <canvas id="output"></canvas>
              </Col>
              <Col />
            </Row>
            <Row className="margin">
              <Col />
              <Col xs="12" md="12" lg="12" xl="10" style={{ textAlign: "center", margin: "20px" }}>
                <p>If you are on a mobile device, long press to save the image.</p>
                <p>If you are on a desktop device, right click to save the image.</p>
                <p>If it looks good, you could <a href="https://github.com/TonyLianLong/AnimeGAN.js">give AnimeGAN.js a star <span role="img" aria-label="star">🌟</span> on Github</a>.</p>
                <p>AnimeGAN.js uses the trained model from AnimeGAN. If you are interested in how the TensorFlow version of AnimeGAN works, <a href="https://github.com/TachibanaYoshino/AnimeGAN">click here</a></p>
                <Button variant="primary" onClick={() => window.location.reload()}>Restart</Button>
              </Col>
              <Col />
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

export default App;
