// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract BaseRunnerContract {
  address public immutable owner;
  uint256 public constant ENTRY_FEE = 0.001 ether;
    uint256 public constant SCORE_REWARD = 10;
    uint256 public constant ENTRY_REWARD = 100;

  struct Runner {
    uint256 id;
    address runnerAddress;
    string runnerName;
    bool isRegistered;
    Score[] scoreList;
    uint256 tokenBalance;
  }

  struct Score {
    uint256 id;
    string score;
  }

  uint256 public _runnerCounter = 0;
  uint256 public _scoreCounter = 0;


  // Mappings for runner
  struct DataStore {
    mapping(address => Runner) runners;
    address[] runnerAddresses;
     mapping(address => bool) isRunner;
     mapping(uint256 => Score) scores;
  }

   DataStore private dataStore;

   // Events
    event RunnerRegistered(address indexed runner, string name);
    event ScoreAdded(address indexed runner, uint256 scoreId);
    event TokensMinted(address indexed runner, uint256 amount);
    event EntryFeePaid(address indexed runner, uint256 amount);
    event TokensTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );

  constructor(address _owner) {
    owner = _owner;
  }

  modifier isOwner() {
    require(msg.sender == owner, "Not the Owner");
    _;
  }

   modifier onlyRegisteredRunner(address _runner) {
        require(dataStore.runners[_runner].isRegistered, "Runner not registered");
        _;
    }

  // Add runner details and ensure unique runner address
  function addRunner(
    address _runnerAddress,
    string memory _runnerName
  ) public returns (string memory) {
    require(
      !dataStore.runners[_runnerAddress].isRegistered,
      "Runner already exists"
    );

    _runnerCounter += 1;

    Runner storage newRunner =
      dataStore.runners[_runnerAddress];

    newRunner.id = _runnerCounter;
    newRunner.runnerAddress = _runnerAddress;
    newRunner.runnerName = _runnerName;
    newRunner.isRegistered = true;
    newRunner.tokenBalance = 0; // Start with 0 tokens

    dataStore.runnerAddresses.push(_runnerAddress);
    dataStore.isRunner[_runnerAddress] = true;

    emit RunnerRegistered(_runnerAddress, _runnerName);
    return "Runner saved successfully";
  }

  // Function to check if a manufacturer exists and update the state variable
    function checkRunner(address _runnerAddress)
    public
    view
    returns (bool)
    {
    return dataStore.runners[_runnerAddress].isRegistered;
    }

    // Modified to allow any registered runner to view all runners
    function getAllRunners() public view returns (Runner[] memory) {
    uint256 runnerCount = dataStore.runnerAddresses.length;
    Runner[] memory allRunners = new Runner[](runnerCount);

    for (uint256 i = 0; i < runnerCount; i++) {
        address runnerAddress = dataStore.runnerAddresses[i];
        allRunners[i] = dataStore.runners[runnerAddress];
    }

    return allRunners;
    }

 // Add a score to the runner's score list and reward with 10 tokens
  function addScore(
    address _runnerAddress,
    string memory _score
  ) public returns (string memory) {
    Runner storage runner =
      dataStore.runners[_runnerAddress];
    require(runner.isRegistered, "Runner not registered");

    _scoreCounter += 1;
    uint256 scoreId = _scoreCounter;

    Score storage newScore = dataStore.scores[scoreId];
    newScore.id = scoreId;
    newScore.score = _score;

    runner.scoreList.push(newScore);
    runner.tokenBalance += SCORE_REWARD;
        
    emit ScoreAdded(_runnerAddress, scoreId);
    emit TokensMinted(_runnerAddress, SCORE_REWARD);

    return "Score saved successfully";
  }

  //Function to get all scores by the runner
  function getAllScoresByRunner(address _runnerAddress) 
        public 
        view 
        returns (Score[] memory)
    {
     Runner storage runner =
      dataStore.runners[_runnerAddress];
    require(runner.isRegistered, "Runner not registered");

    return runner.scoreList; 
    }

    // Transfer tokens between runners
    function transferTokens(
    address _from,
    address _to,
    uint256 _amount
) public onlyRegisteredRunner(_from) onlyRegisteredRunner(_to) returns (string memory) {
    require(_amount > 0, "Amount must be positive");
    require(
        dataStore.runners[_from].tokenBalance >= _amount,
        "Insufficient token balance"
    );
    require(
        dataStore.runners[_to].tokenBalance + _amount >= dataStore.runners[_to].tokenBalance,
        "Token overflow protection"
    );
    require(_from != _to, "Cannot transfer to yourself");

    // Perform transfer
    dataStore.runners[_from].tokenBalance -= _amount;
    dataStore.runners[_to].tokenBalance += _amount;

    emit TokensTransferred(_from, _to, _amount);
    
    return "Tokens transferred successfully";
}

    // Pay entry fee to receive 100 tokens
    function payEntryFee(
        address _runnerAddress
    ) public payable onlyRegisteredRunner(_runnerAddress) {
        
        dataStore.runners[_runnerAddress].tokenBalance += ENTRY_REWARD;
        
        emit EntryFeePaid(_runnerAddress, ENTRY_FEE);
        emit TokensMinted(_runnerAddress, ENTRY_REWARD);
    }

    // Get token balance for a runner
    function getTokenBalance(address _runnerAddress) 
        public 
        view 
        onlyRegisteredRunner(_runnerAddress) 
        returns (uint256) 
    {
        return dataStore.runners[_runnerAddress].tokenBalance;
    }

    function resetAllRunners() public isOwner {
    _runnerCounter = 0;
    delete dataStore.runnerAddresses;
}

   // Withdraw contract balance (owner only)
    function withdraw() public isOwner {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    receive() external payable { }
}