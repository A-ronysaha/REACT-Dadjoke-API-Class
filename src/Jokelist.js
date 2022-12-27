import React, { Component } from "react";
import axios from "axios";
import "./Jokelist.css";
import Jokedisplay from "./Jokedisplay";
const { v4: uuidv4 } = require("uuid");
class Jokelist extends Component {
  static defaultProps = {
    maxJoke: 10,
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      jokes: JSON.parse(window.localStorage.getItem("Joke")) || [],
    };
    this.seenJokes = new Set(this.state.jokes.map((k) => k.text));
    console.log(this.seenJokes);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJoke(); /// doesnot over-ride the old existing joke in local-storage as we refresh the page.
    }
  }

  async getJoke() {
    try {
      let jokeArr = [];
      while (jokeArr.length < this.props.maxJoke) {
        let jokesApi = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJoke = jokesApi.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokeArr.push({ id: uuidv4(), text: newJoke, votes: 0 });
        } else {
          console.log("FOUND A DUPLICATE...");
          console.log(newJoke);
        }
      }
      this.setState(
        (st) => ({
          loading: false,
          jokes: [...st.jokes, ...jokeArr],
        }),
        () =>
          window.localStorage.setItem("Joke", JSON.stringify(this.state.jokes))
      );
      window.localStorage.setItem("Joke", JSON.stringify(jokeArr));
    } catch (e) {
      alert(e);
    }
  }

  handleVotes(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("Joke", JSON.stringify(this.state.jokes))
    );
  }

  handleClick() {
    this.setState({ loading: true }, this.getJoke);
  }
  render() {
    if (this.state.loading) {
      return (
        <div className="Jokelist-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="Jokelist-title">Loading...</h1>
        </div>
      );
    }
    let sortJokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="Jokelist">
        <div className="Jokelist-sidebar">
          <h1 className="Jokelist-title">
            <span>DAD</span>_JOKES..
          </h1>
          <img src="https://thumbs.dreamstime.com/b/thumbs-up-emoticon-vector-design-showing-73992493.jpg" />
          <button className="Jokelist-getmore" onClick={this.handleClick}>
            Fetch Joke
          </button>
        </div>
        <section className="Jokelist-jokes">
          {sortJokes.map((j) => (
            <Jokedisplay
              key={j.id}
              text={j.text}
              votes={j.votes}
              upvote={() => this.handleVotes(j.id, +1)}
              downvote={() => this.handleVotes(j.id, -1)}
            />
          ))}
        </section>
      </div>
    );
  }
}
export default Jokelist;
