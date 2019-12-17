/*
  Add these to your `package.json`:
    "apollo-boost": "0.1.27",
    "graphql": "14.1.1",
    "graphql-tag": "2.10.1",
    "onegraph-apollo-client": "1.2.21",
    "onegraph-auth": "1.2.22",
    "react-apollo": "2.4.1"
*/

import gql from "graphql-tag";
import React from "react";
import ReactDOM from "react-dom";
import { Query, ApolloProvider } from "react-apollo";
import {
  Flex,
  Avatar,
  BorderBox,
  Link,
  Heading,
  BaseStyles,
  Button,
  Box
} from "@primer/components";
import Octicon, { Repo, Star } from "@primer/octicons-react";

import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";

const APP_ID = "e3c6563f-0dac-406e-b391-f00165093abf";

const auth = new OneGraphAuth({
  appId: APP_ID
});

const apolloClient = new OneGraphApolloClient({
  oneGraphAuth: auth
});

const MY_FIRST_REPO_QUERY = gql`
  query MyFirstRepo {
    gitHub {
      viewer {
        repositories(
          first: 1
          orderBy: { direction: ASC, field: CREATED_AT }
          ownerAffiliations: OWNER
        ) {
          edges {
            node {
              name
              description
              url
              createdAt
              updatedAt
              stargazers {
                totalCount
              }
            }
          }
        }
        avatarUrl
      }
    }
  }
`;

const MyFirstRepoQuery = props => {
  const serviceName = "github";
  return (
    <Query query={MY_FIRST_REPO_QUERY}>
      {({ loading, error, data, refetch }) => {
        if (loading) return <pre>Loading</pre>;
        if (error)
          return (
            <>
              <BaseStyles>
                <Box m={4}>
                  <Heading mb={2}>What is your first GitHub Repo?</Heading>
                  <p>
                    Powered by <a href="https://onegraph.io">OneGraph</a> and
                    inspired by{" "}
                    <a href="https://twitter.com/hashtag/MyFirstRepo?src=hashtag_click">
                      #MyFirstRepo
                    </a>
                  </p>

                  <Button
                    onClick={async () => {
                      await auth.login(serviceName);
                      const loginSuccess = await auth.isLoggedIn(serviceName);
                      if (loginSuccess) {
                        console.log("Successfully logged into " + serviceName);
                        refetch();
                      } else {
                        console.log(
                          "The user did not grant auth to " + serviceName
                        );
                      }
                    }}
                  >
                    Login to see your first repo
                  </Button>
                </Box>
              </BaseStyles>
            </>
          );

        const repo = data.gitHub.viewer.repositories.edges[0].node;
        const avatar = data.gitHub.viewer.avatarUrl;

        if (data) {
          return (
            <>
              <BaseStyles>
                <BorderBox p={4} m={4}>
                  <Heading mb={2}>
                    {repo.name} is your first GitHub Repo!
                  </Heading>
                  <p>
                    <Flex style={{ alignItems: "center" }}>
                      <Octicon mt={8} icon={Repo} />
                      <Link ml={1} href={repo.url}>
                        {repo.name}
                      </Link>
                    </Flex>
                  </p>
                  <p>{repo.description}</p>
                  <p>
                    <Octicon icon={Star} />
                    {repo.stargazers.totalCount}
                  </p>

                  <Avatar size={35} src={avatar} />

                  <Button
                    onClick={() => {
                      auth
                        .logout("github")
                        .then(() => refetch())
                        .catch(() => console.log("Logged out"));
                    }}
                  >
                    Logout of GitHub
                  </Button>
                </BorderBox>
              </BaseStyles>
            </>
          );
        }
      }}
    </Query>
  );
};

const container = (
  <ApolloProvider client={apolloClient}>
    <MyFirstRepoQuery />
  </ApolloProvider>
);

ReactDOM.render(container, document.getElementById("root"));
