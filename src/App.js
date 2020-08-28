import React, { Component } from "react";
import { List, Map } from "immutable";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import * as d3 from "d3";
import Cards from "./Cards";
import "./App.css";

const pageSize = 12;

async function fetchGet(url) {
  const res = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
  });
  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res;
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      items: List([]),
      filteredItems: List([]),
      targetLabel: null,
      changes: Map(),
      page: -1,
      csvFilename: null,
    };
    this.classMap = null;
  }

  loadCsv = (filename) => {
    console.log(`/${filename}`);
    d3.csv(`/${filename}`)
      .then((data) =>
        data
          .map((d) =>
            Map({
              truth_prob: +d.truth_prob,
              max_prob: +d.max_prob,
              pred: +d.pred,
              truth: +d.truth,
              path: d.path,
            })
          )
          .sort((a, b) => a.get("truth_prob") - b.get("truth_prob"))
      )
      .then(async (rows) => {
        let changes = Map();
        try {
          const res = await fetchGet(
            `/${filename.split("_")[0] + "-changed.json"}`
          );
          changes = Map(await res.json());
          let tmp = {};
          changes.forEach((value) => {
            tmp[value[0]] = parseInt(value[1]);
          });
          changes = Map(tmp);
        } catch (error) {
          console.log(error);
        }
        const items = rows.map((row, idx) => row.set("idx", idx));
        this.setState({
          items: List(items),
          filteredItems: List(items),
          csvFilename: filename,
          targetLabel: null,
          changes: changes,
          page: 1,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  exportToJsonFile = () => {
    let target = {};
    this.state.changes.forEach((val, key) => {
      const item = this.state.items.get(key);
      target[item.get("path")] = [key, val];
    });

    let dataStr = JSON.stringify(target);
    let dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    let exportFileDefaultName =
      this.state.csvFilename.split("_")[0] + "-changed.json";

    let linkElement = document.getElementById("downloadAnchorElem");
    console.log(linkElement);
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  async componentDidMount() {
    // load class idx to name mapping
    const res = await fetchGet(`/id_to_name_map.json`);
    const classMap = Map(await res.json());
    this.classMap = classMap;
    console.log(this.classMap);
  }

  // filterLabel = (label) => (e) => {
  //   let tmp = [];
  //   for (let i = 0; i < this.state.items.size; i++) {
  //     if (this.state.items.get(i).get("truth") === label) {
  //       const item = this.state.items.get(i);
  //       tmp.push(item.set("idx", i));
  //     }
  //   }
  //   this.setState({
  //     filteredItems: List(tmp),
  //     targetLabel: label,
  //     page: 1,
  //   });
  // };

  changeLabel = (idx, label) => (e) => {
    const sidx = idx.toString();
    if (
      this.state.changes.get(sidx) !== undefined &&
      this.state.items.get(sidx).get("truth") === label
    ) {
      this.setState({
        changes: this.state.changes.delete(sidx),
      });
    } else {
      this.setState({
        changes: this.state.changes.set(sidx, label),
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <center className="mt-5 mb-3">
          <h1>Image Classification Dataset Cleaner</h1>
        </center>
        <Container fluid={false}>
          <Row className="justify-content-center">
            <Col xs={12} className="text-center">
              <Button
                size="sm"
                variant="warning"
                className="ml-2"
                onClick={this.exportToJsonFile}
              >
                Export
              </Button>
              <Button
                size="sm"
                variant={
                  this.state.csvFilename === "valid_preds.csv"
                    ? "success"
                    : "info"
                }
                onClick={() => this.loadCsv("valid_preds.csv")}
              >
                Load Predictions (Valid Set)
              </Button>
            </Col>
          </Row>
          <Row>
            <Cards
              entries={this.state.filteredItems}
              targetLabel={this.state.targetLabel}
              page={this.state.page}
              changes={this.state.changes}
              classMap={this.classMap}
              pageSize={pageSize}
              changeLabel={this.changeLabel}
            />
          </Row>
          <Row className="justify-content-center">
            <Col xs={12} className="text-center">
              <Button
                disabled={this.state.page < 2}
                onClick={() => this.setState({ page: this.state.page - 1 })}
                variant="outline-info"
              >
                Prev
              </Button>
              <input
                type="text"
                pattern="[0-9]*"
                value={this.state.page}
                style={{ width: "50px" }}
                onChange={(e) =>
                  e.target.validity.valid
                    ? this.setState({ page: parseInt(e.target.value) })
                    : null
                }
              />
              <Button
                disabled={this.state.page === -1}
                onClick={() => this.setState({ page: this.state.page + 1 })}
                variant="outline-info"
              >
                Next
              </Button>
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

export default App;
