# Introduction into self-driving cars

This project is an introduction into self-driving cars developed in JavaScript, featuring some Python backend components. Its purpose is to demonstrate how simple feedforward neural networks can autonomously navigate an obstacle course without sustaining damage.
With little intervention by the user in assisting / evaluating the models performance, it is able to learn rapidly and thereby gives you a first understanding into the topic of Reinforcement Learning.

## Features
- Interactive web-based application to play and learning
- Live visualization of the neural networks signals
- Configurable settings (neural network structure, traffic, sensors etc.) - See the learning effects yourself
- Prebuilt connector from a JavaScript frontend to a Python backend using [Axios](#) and [Flask](#)
- ...

## Getting Started

Move to desired project folder and clone the repo:
```bash
cd your_project_folder
git clone https://github.com/g-noth/intro-self-driving-cars.git
cd intro-self-driving-cars
```
Before running the project, you need to install the required dependencies. Run the following command to install the necessary libraries using the provided YAML file.

Using pip:

```bash
pip install -r environment.yaml
```

Using conda:
```bash
conda create --name intro-self-driving-cars
conda activate intro-self-driving-cars
```

Recommended: Install the VS Code extension "Live Server" to launch a local development server for live visualization.

Right-click index.html and choose "Open with Live Server" in the directory. Have fun!

## How it works

### Frontend


### Backend


### Configuration Options


## Collaboration

Move to desired project folder and clone the repo:
```bash
cd your_project_folder
git clone https://github.com/g-noth/intro-self-driving-cars.git
```

Before starting work on a new feature, create a new branch from the main branch:
```bash
git checkout -b feature/new-feature-name
```

Commit and push changes to your feature branch:
```bash
git add .
git commit -m "Description of changes"

git push origin feature/new-feature-name
```

Next, open a pull request.


## Sources:

This project is adapted from the free JS course on Youtube: 

- [YouTube Course](https://www.youtube.com/watch?v=Rs_rAxEsAvI&t=7832s)
- [GitHub Repository](https://github.com/gniziemazity/Self-driving-car)
