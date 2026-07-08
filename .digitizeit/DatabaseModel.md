# Database Model

**Type:** DatabaseModel
**Created:** 2026-07-08 07:57:33 UTC
**Updated:** 2026-07-08 07:57:33 UTC

---

```sql
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AI_Agents (
    agent_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Active', 'Needs Setup', 'Paused') DEFAULT 'Needs Setup',
    task_count INT DEFAULT 0,
    tool_count INT DEFAULT 0,
    last_active TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Capabilities (
    capability_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Agent_Capabilities (
    agent_capability_id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT,
    capability_id INT,
    enabled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (agent_id) REFERENCES AI_Agents(agent_id) ON DELETE CASCADE,
    FOREIGN KEY (capability_id) REFERENCES Capabilities(capability_id) ON DELETE CASCADE
);

CREATE TABLE Tools (
    tool_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    connection_status ENUM('Connected', 'Disconnected') DEFAULT 'Disconnected',
    access_level ENUM('Read & Write', 'Read-only', 'Draft only') DEFAULT 'Read-only',
    description TEXT
);

CREATE TABLE Agent_Tools (
    agent_tool_id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT,
    tool_id INT,
    FOREIGN KEY (agent_id) REFERENCES AI_Agents(agent_id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES Tools(tool_id) ON DELETE CASCADE
);

CREATE TABLE Knowledge_Sources (
    source_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Connected', 'Missing', 'Recommended') DEFAULT 'Missing'
);

CREATE TABLE Agent_Knowledge (
    agent_knowledge_id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT,
    source_id INT,
    FOREIGN KEY (agent_id) REFERENCES AI_Agents(agent_id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES Knowledge_Sources(source_id) ON DELETE CASCADE
);

CREATE TABLE Memory (
    memory_id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    memory_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES AI_Agents(agent_id) ON DELETE CASCADE
);

CREATE TABLE Activity_Logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT,
    description TEXT,
    status ENUM('Success', 'Warning', 'Error', 'Pending') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES AI_Agents(agent_id) ON DELETE CASCADE
);
```
